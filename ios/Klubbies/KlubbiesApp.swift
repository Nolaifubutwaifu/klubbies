import SwiftUI

@main
struct KlubbiesApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @State private var pageIsDark = false

    var body: some Scene {
        WindowGroup {
            WebContainer(pageIsDark: $pageIsDark)
                .ignoresSafeArea()
                .preferredColorScheme(.light)
                .statusBarHidden(pageIsDark)
                .animation(.easeInOut(duration: 0.2), value: pageIsDark)
        }
    }
}

/// Hosts the UIKit web view controller inside SwiftUI.
struct WebContainer: UIViewControllerRepresentable {
    @Binding var pageIsDark: Bool

    func makeUIViewController(context: Context) -> WebViewController {
        let controller = WebViewController()
        controller.onPageDarkChange = { dark in pageIsDark = dark }
        return controller
    }
    func updateUIViewController(_ controller: WebViewController, context: Context) {}
}
