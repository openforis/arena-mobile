package expo.modules.pdfmaprenderer

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.Rect
import android.graphics.pdf.PdfRenderer
import android.os.ParcelFileDescriptor
import android.util.Log
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import java.io.File
import java.io.FileOutputStream

class RenderTileTarget : Record {
  @Field
  val col: Int = 0

  @Field
  val row: Int = 0

  @Field
  val path: String = ""
}

class RenderTilesOptions : Record {
  @Field
  val pdfPath: String = ""

  @Field
  val pageIndex: Int = 0

  // affine transform [a, b, c, d, e, f] from display space (points, origin top-left) to block pixels
  @Field
  val matrix: List<Double> = emptyList()

  // map frame in block pixels (x0, y0, x1, y1, ...): content outside it is transparent
  @Field
  val clipPolygon: List<Double> = emptyList()

  @Field
  val width: Int = 0

  @Field
  val height: Int = 0

  @Field
  val tileSize: Int = 256

  @Field
  val jpegQuality: Int = 85

  @Field
  val tiles: List<RenderTileTarget> = emptyList()
}

class OverviewTileTarget : Record {
  @Field
  val path: String = ""

  // child tiles of the next zoom level: top-left, top-right, bottom-left, bottom-right
  @Field
  val children: List<String> = emptyList()
}

class BuildOverviewTilesOptions : Record {
  @Field
  val tileSize: Int = 256

  @Field
  val jpegQuality: Int = 85

  @Field
  val tiles: List<OverviewTileTarget> = emptyList()
}

class PdfOpenException(path: String, cause: Throwable?) :
  CodedException("ERR_PDF_OPEN", "Cannot open PDF file: $path", cause)

class PdfMapRendererModule : Module() {
  companion object {
    private const val TAG = "PdfMapRenderer"
  }

  private val lock = Any()
  private var openPath: String? = null
  private var fileDescriptor: ParcelFileDescriptor? = null
  private var renderer: PdfRenderer? = null

  override fun definition() = ModuleDefinition {
    Name("PdfMapRenderer")

    AsyncFunction("getPageCount") { pdfPath: String ->
      synchronized(lock) { openRenderer(pdfPath).pageCount }
    }

    AsyncFunction("renderTiles") { options: RenderTilesOptions ->
      synchronized(lock) { renderTiles(options) }
    }

    AsyncFunction("buildOverviewTiles") { options: BuildOverviewTilesOptions ->
      buildOverviewTiles(options)
    }

    AsyncFunction<Unit>("closeDocument") {
      synchronized(lock) { closeRenderer() }
    }

    OnDestroy {
      synchronized(lock) { closeRenderer() }
    }
  }

  private fun openRenderer(pdfPath: String): PdfRenderer {
    val current = renderer
    if (current != null && openPath == pdfPath) return current
    closeRenderer()
    try {
      val descriptor = ParcelFileDescriptor.open(File(pdfPath), ParcelFileDescriptor.MODE_READ_ONLY)
      fileDescriptor = descriptor
      val newRenderer = PdfRenderer(descriptor)
      renderer = newRenderer
      openPath = pdfPath
      return newRenderer
    } catch (e: Exception) {
      closeRenderer()
      throw PdfOpenException(pdfPath, e)
    }
  }

  private fun closeRenderer() {
    try {
      renderer?.close()
    } catch (e: Exception) {
      Log.w(TAG, "error closing PDF renderer", e)
    }
    try {
      fileDescriptor?.close()
    } catch (e: Exception) {
      Log.w(TAG, "error closing PDF file", e)
    }
    renderer = null
    fileDescriptor = null
    openPath = null
  }

  private fun createClipPath(points: List<Double>): Path? {
    if (points.size < 6) return null
    val path = Path()
    path.moveTo(points[0].toFloat(), points[1].toFloat())
    var index = 2
    while (index + 1 < points.size) {
      path.lineTo(points[index].toFloat(), points[index + 1].toFloat())
      index += 2
    }
    path.close()
    return path
  }

  private fun renderTiles(options: RenderTilesOptions): Map<String, Any> {
    val pdfRenderer = openRenderer(options.pdfPath)
    val bitmap = Bitmap.createBitmap(options.width, options.height, Bitmap.Config.ARGB_8888)
    try {
      val canvas = Canvas(bitmap)
      val clipPath = createClipPath(options.clipPolygon)
      // white paper inside the map frame; the page is rendered over the bitmap content
      if (clipPath != null) {
        canvas.drawPath(clipPath, Paint().apply {
          color = Color.WHITE
          style = Paint.Style.FILL
          isAntiAlias = true
        })
      } else {
        bitmap.eraseColor(Color.WHITE)
      }
      val m = options.matrix
      val transform = Matrix()
      transform.setValues(
        floatArrayOf(
          m[0].toFloat(), m[2].toFloat(), m[4].toFloat(),
          m[1].toFloat(), m[3].toFloat(), m[5].toFloat(),
          0f, 0f, 1f
        )
      )
      val page = pdfRenderer.openPage(options.pageIndex)
      try {
        page.render(bitmap, null, transform, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
      } finally {
        page.close()
      }
      if (clipPath != null) {
        clipPath.fillType = Path.FillType.INVERSE_WINDING
        canvas.drawPath(clipPath, Paint().apply {
          xfermode = PorterDuffXfermode(PorterDuff.Mode.CLEAR)
          style = Paint.Style.FILL
          isAntiAlias = true
        })
      }
      var written = 0
      var bytes = 0L
      val tileSize = options.tileSize
      for (target in options.tiles) {
        val x = target.col * tileSize
        val y = target.row * tileSize
        if (x < 0 || y < 0 || x + tileSize > bitmap.width || y + tileSize > bitmap.height) continue
        val size = writeTile(bitmap, Rect(x, y, x + tileSize, y + tileSize), target.path, options.jpegQuality)
        if (size > 0) {
          written += 1
          bytes += size
        }
      }
      return mapOf("written" to written, "bytes" to bytes.toDouble())
    } finally {
      bitmap.recycle()
    }
  }

  private fun buildOverviewTiles(options: BuildOverviewTilesOptions): Map<String, Any> {
    val tileSize = options.tileSize
    val half = tileSize / 2
    var written = 0
    var bytes = 0L
    val paint = Paint().apply {
      isFilterBitmap = true
      isAntiAlias = true
    }
    for (target in options.tiles) {
      val bitmap = Bitmap.createBitmap(tileSize, tileSize, Bitmap.Config.ARGB_8888)
      try {
        val canvas = Canvas(bitmap)
        var hasChildren = false
        target.children.forEachIndexed { index, childPath ->
          if (index > 3) return@forEachIndexed
          val file = File(childPath)
          if (!file.exists()) return@forEachIndexed
          val child = BitmapFactory.decodeFile(childPath) ?: return@forEachIndexed
          val left = (index % 2) * half
          val top = (index / 2) * half
          canvas.drawBitmap(child, null, Rect(left, top, left + half, top + half), paint)
          child.recycle()
          hasChildren = true
        }
        if (hasChildren) {
          val size = writeTile(bitmap, Rect(0, 0, tileSize, tileSize), target.path, options.jpegQuality)
          if (size > 0) {
            written += 1
            bytes += size
          }
        }
      } finally {
        bitmap.recycle()
      }
    }
    return mapOf("written" to written, "bytes" to bytes.toDouble())
  }

  // writes the region of the bitmap as a tile: JPEG when fully opaque, PNG otherwise;
  // empty (fully transparent) tiles are not written; returns the size of the written file
  private fun writeTile(source: Bitmap, region: Rect, path: String, jpegQuality: Int): Long {
    val width = region.width()
    val height = region.height()
    val pixels = IntArray(width * height)
    source.getPixels(pixels, 0, width, region.left, region.top, width, height)
    var anyVisible = false
    var allOpaque = true
    for (pixel in pixels) {
      val alpha = pixel ushr 24
      if (alpha != 0) anyVisible = true
      if (alpha != 255) allOpaque = false
      if (anyVisible && !allOpaque) break
    }
    if (!anyVisible) return 0
    val tile = Bitmap.createBitmap(pixels, width, height, Bitmap.Config.ARGB_8888)
    try {
      val file = File(path)
      file.parentFile?.mkdirs()
      FileOutputStream(file).use { out ->
        if (allOpaque) {
          tile.compress(Bitmap.CompressFormat.JPEG, jpegQuality, out)
        } else {
          tile.compress(Bitmap.CompressFormat.PNG, 100, out)
        }
      }
      return file.length()
    } finally {
      tile.recycle()
    }
  }
}
