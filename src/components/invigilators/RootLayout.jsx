import React from "react";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "../components/ErrorReporter";

export default function RootLayout({ children }) {
  return (
    <div className="app-root">

      {/* Browser logs */}
      <script
        id="orchids-browser-logs"
        src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
        data-orchids-project-id="73e31f84-7c9d-4428-bccc-c14ad0dc6b24"
      ></script>

      {/* Error reporter */}
      <ErrorReporter />

      {/* Page Content */}
      {children}

      {/* Messaging script */}
      <script
        src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
        data-target-origin="*"
        data-message-type="ROUTE_CHANGE"
        data-include-search-params="true"
        data-only-in-iframe="true"
        data-debug="true"
        data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
      ></script>

      <VisualEditsMessenger />
    </div>
  );
}
