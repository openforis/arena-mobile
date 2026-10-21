package expo.modules.geointent

import android.content.Intent
import androidx.core.net.toUri
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class GeoIntentModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("GeoIntent")

    // packages of the installed apps able to view the uri (visibility depends on the manifest <queries>)
    Function("getHandlerPackages") { uri: String ->
      val packageManager = appContext.reactContext?.packageManager
        ?: throw Exceptions.ReactContextLost()
      @Suppress("DEPRECATION")
      packageManager
        .queryIntentActivities(Intent(Intent.ACTION_VIEW, uri.toUri()), 0)
        .map { it.activityInfo.packageName }
        .distinct()
    }

    // opens the uri in the app with the specified package, or lets the user choose the app
    Function("open") { uri: String, packageName: String? ->
      val intent = Intent(Intent.ACTION_VIEW, uri.toUri())
      val activity = appContext.throwingActivity
      if (packageName != null) {
        intent.setPackage(packageName)
        activity.startActivity(intent)
      } else {
        activity.startActivity(Intent.createChooser(intent, null))
      }
    }
  }
}
