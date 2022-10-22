#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::env;
use native_tls::TlsConnector;
use tokio_tungstenite::{connect_async, connect_async_tls_with_config, connect_async_with_config};
use tokio_tungstenite::Connector::NativeTls;
use tokio_tungstenite::tungstenite::http::Request;
use tokio_tungstenite::tungstenite::protocol::WebSocketConfig;
use tokio_tungstenite::tungstenite::stream::Mode::Tls;


fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![create_websocket])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
async fn create_websocket(url: String, cookie: String) {
  let (ws_stream, _) = connect_async_tls_with_config(
    Request::builder()
        .uri(&url)
        .method("GET")
        .header("cookie", &cookie)
        .body(()).unwrap(),
    None,
    Option::from(NativeTls(TlsConnector::new().unwrap()))
      )
      .await.expect("Failed to connect to websocket");
}
