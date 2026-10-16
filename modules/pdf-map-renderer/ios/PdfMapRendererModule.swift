import CoreGraphics
import ExpoModulesCore
import ImageIO
import UIKit

internal struct RenderTileTarget: Record {
  @Field
  var col: Int = 0

  @Field
  var row: Int = 0

  @Field
  var path: String = ""
}

internal struct RenderTilesOptions: Record {
  @Field
  var pdfPath: String = ""

  @Field
  var pageIndex: Int = 0

  // affine transform [a, b, c, d, e, f] from display space (points, origin top-left) to block pixels
  @Field
  var matrix: [Double] = []

  // map frame in block pixels (x0, y0, x1, y1, ...): content outside it is transparent
  @Field
  var clipPolygon: [Double] = []

  @Field
  var width: Int = 0

  @Field
  var height: Int = 0

  @Field
  var tileSize: Int = 256

  @Field
  var jpegQuality: Int = 85

  @Field
  var tiles: [RenderTileTarget] = []
}

internal struct OverviewTileTarget: Record {
  @Field
  var path: String = ""

  // child tiles of the next zoom level: top-left, top-right, bottom-left, bottom-right
  @Field
  var children: [String] = []
}

internal struct BuildOverviewTilesOptions: Record {
  @Field
  var tileSize: Int = 256

  @Field
  var jpegQuality: Int = 85

  @Field
  var tiles: [OverviewTileTarget] = []
}

internal final class PdfOpenException: GenericException<String> {
  override var reason: String {
    "Cannot open PDF file: \(param)"
  }
}

internal final class PdfPageNotFoundException: GenericException<Int> {
  override var reason: String {
    "PDF page not found: \(param)"
  }
}

internal final class BitmapCreationException: Exception {
  override var reason: String {
    "Cannot create the bitmap to render the map tiles"
  }
}

public class PdfMapRendererModule: Module {
  private let lock = NSLock()
  private var openPath: String?
  private var document: CGPDFDocument?

  public func definition() -> ModuleDefinition {
    Name("PdfMapRenderer")

    AsyncFunction("getPageCount") { (pdfPath: String) -> Int in
      self.lock.lock()
      defer { self.lock.unlock() }
      return try self.openDocument(pdfPath).numberOfPages
    }

    AsyncFunction("renderTiles") { (options: RenderTilesOptions) -> [String: Any] in
      self.lock.lock()
      defer { self.lock.unlock() }
      return try self.renderTiles(options)
    }

    AsyncFunction("buildOverviewTiles") { (options: BuildOverviewTilesOptions) -> [String: Any] in
      return try self.buildOverviewTiles(options)
    }

    AsyncFunction("closeDocument") {
      self.lock.lock()
      defer { self.lock.unlock() }
      self.document = nil
      self.openPath = nil
    }
  }

  private func openDocument(_ pdfPath: String) throws -> CGPDFDocument {
    if let document = document, openPath == pdfPath {
      return document
    }
    document = nil
    openPath = nil
    guard let newDocument = CGPDFDocument(URL(fileURLWithPath: pdfPath) as CFURL) else {
      throw PdfOpenException(pdfPath)
    }
    if newDocument.isEncrypted && !newDocument.isUnlocked {
      throw PdfOpenException(pdfPath)
    }
    document = newDocument
    openPath = pdfPath
    return newDocument
  }

  // bitmap context with the origin at the top-left corner (y axis down), as the display space
  private func createContext(width: Int, height: Int) throws -> CGContext {
    guard let context = CGContext(
      data: nil,
      width: width,
      height: height,
      bitsPerComponent: 8,
      bytesPerRow: width * 4,
      space: CGColorSpace(name: CGColorSpace.sRGB) ?? CGColorSpaceCreateDeviceRGB(),
      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    ) else {
      throw BitmapCreationException()
    }
    context.clear(CGRect(x: 0, y: 0, width: width, height: height))
    context.translateBy(x: 0, y: CGFloat(height))
    context.scaleBy(x: 1, y: -1)
    context.interpolationQuality = .high
    return context
  }

  private func createClipPath(_ points: [Double]) -> CGPath? {
    if points.count < 6 {
      return nil
    }
    let path = CGMutablePath()
    path.move(to: CGPoint(x: points[0], y: points[1]))
    var index = 2
    while index + 1 < points.count {
      path.addLine(to: CGPoint(x: points[index], y: points[index + 1]))
      index += 2
    }
    path.closeSubpath()
    return path
  }

  private func renderTiles(_ options: RenderTilesOptions) throws -> [String: Any] {
    let pdfDocument = try openDocument(options.pdfPath)
    // CGPDFDocument pages are 1-based
    guard let page = pdfDocument.page(at: options.pageIndex + 1) else {
      throw PdfPageNotFoundException(options.pageIndex)
    }
    let context = try createContext(width: options.width, height: options.height)

    context.saveGState()
    if let clipPath = createClipPath(options.clipPolygon) {
      context.addPath(clipPath)
      context.clip()
    }
    // white paper inside the map frame
    context.setFillColor(UIColor.white.cgColor)
    context.fill(CGRect(x: 0, y: 0, width: options.width, height: options.height))

    let m = options.matrix
    if m.count >= 6 {
      context.concatenate(CGAffineTransform(a: m[0], b: m[1], c: m[2], d: m[3], tx: m[4], ty: m[5]))
    }
    // display space (origin top-left, y down, page rotation applied) -> PDF user space
    let cropBox = page.getBoxRect(.cropBox)
    let rotation = ((Int(page.rotationAngle) % 360) + 360) % 360
    let rotatedSize = rotation % 180 == 0
      ? cropBox.size
      : CGSize(width: cropBox.height, height: cropBox.width)
    context.concatenate(CGAffineTransform(a: 1, b: 0, c: 0, d: -1, tx: 0, ty: rotatedSize.height))
    context.concatenate(page.getDrawingTransform(
      .cropBox,
      rect: CGRect(origin: .zero, size: rotatedSize),
      rotate: 0,
      preserveAspectRatio: true
    ))
    context.drawPDFPage(page)
    context.restoreGState()

    var written = 0
    var bytes: Int64 = 0
    let tileSize = options.tileSize
    for target in options.tiles {
      let x = target.col * tileSize
      let y = target.row * tileSize
      if x < 0 || y < 0 || x + tileSize > options.width || y + tileSize > options.height {
        continue
      }
      let size = try writeTile(
        context: context,
        region: CGRect(x: x, y: y, width: tileSize, height: tileSize),
        path: target.path,
        jpegQuality: options.jpegQuality
      )
      if size > 0 {
        written += 1
        bytes += size
      }
    }
    return ["written": written, "bytes": Double(bytes)]
  }

  private func buildOverviewTiles(_ options: BuildOverviewTilesOptions) throws -> [String: Any] {
    let tileSize = options.tileSize
    let half = CGFloat(tileSize) / 2
    var written = 0
    var bytes: Int64 = 0
    for target in options.tiles {
      let context = try createContext(width: tileSize, height: tileSize)
      var hasChildren = false
      for (index, childPath) in target.children.prefix(4).enumerated() {
        guard FileManager.default.fileExists(atPath: childPath),
          let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: childPath) as CFURL, nil),
          let child = CGImageSourceCreateImageAtIndex(source, 0, nil)
        else {
          continue
        }
        let rect = CGRect(
          x: CGFloat(index % 2) * half,
          y: CGFloat(index / 2) * half,
          width: half,
          height: half
        )
        // the context is flipped: draw the image upside down so that it appears upright
        context.saveGState()
        context.translateBy(x: rect.minX, y: rect.maxY)
        context.scaleBy(x: 1, y: -1)
        context.draw(child, in: CGRect(origin: .zero, size: rect.size))
        context.restoreGState()
        hasChildren = true
      }
      if hasChildren {
        let size = try writeTile(
          context: context,
          region: CGRect(x: 0, y: 0, width: tileSize, height: tileSize),
          path: target.path,
          jpegQuality: options.jpegQuality
        )
        if size > 0 {
          written += 1
          bytes += size
        }
      }
    }
    return ["written": written, "bytes": Double(bytes)]
  }

  // writes the region of the context as a tile: JPEG when fully opaque, PNG otherwise;
  // empty (fully transparent) tiles are not written; returns the size of the written file
  private func writeTile(context: CGContext, region: CGRect, path: String, jpegQuality: Int) throws -> Int64 {
    guard let data = context.data else {
      return 0
    }
    let pixels = data.bindMemory(to: UInt8.self, capacity: context.bytesPerRow * context.height)
    let bytesPerRow = context.bytesPerRow
    var anyVisible = false
    var allOpaque = true
    // the first row of the bitmap memory is the top row of the image
    for row in Int(region.minY)..<Int(region.maxY) {
      let rowOffset = row * bytesPerRow
      for col in Int(region.minX)..<Int(region.maxX) {
        let alpha = pixels[rowOffset + col * 4 + 3]
        if alpha != 0 {
          anyVisible = true
        }
        if alpha != 255 {
          allOpaque = false
        }
      }
      if anyVisible && !allOpaque {
        break
      }
    }
    if !anyVisible {
      return 0
    }
    guard let image = context.makeImage()?.cropping(to: region) else {
      return 0
    }
    let uiImage = UIImage(cgImage: image)
    let encoded = allOpaque
      ? uiImage.jpegData(compressionQuality: CGFloat(jpegQuality) / 100)
      : uiImage.pngData()
    guard let tileData = encoded else {
      return 0
    }
    let fileUrl = URL(fileURLWithPath: path)
    try FileManager.default.createDirectory(
      at: fileUrl.deletingLastPathComponent(),
      withIntermediateDirectories: true
    )
    try tileData.write(to: fileUrl)
    return Int64(tileData.count)
  }
}
