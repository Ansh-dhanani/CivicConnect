import Flutter
import UIKit

@main
@objc class AppDelegate: FlutterAppDelegate {
  /// Performs application launch setup and registers Flutter plugins.
  /// 
  /// Registers Flutter plugins with the app delegate and forwards launch handling to the superclass.
  /// - Returns: `true` if the application finished launching successfully, `false` otherwise.
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}