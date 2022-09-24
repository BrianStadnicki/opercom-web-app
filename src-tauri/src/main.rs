#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::collections::HashMap;
use reqwest::StatusCode;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler!(fetch_cors))
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
async fn fetch_cors(uri: &str, method: &str, headers: HashMap<&str, &str>, body: &str) -> Result<(u16, String), (u16, String)> {
  println!("fetching {}", uri);
  let client = reqwest::Client::builder()
      .build().unwrap();

  let mut request = match method {
    "GET" => client.get(uri),
    "POST" => client.post(uri),
    "PATCH" => client.patch(uri),
    "DELETE" => client.delete(uri),
    &_ => client.get(uri)
  };

  request = request.body(body.to_string());

  for (key, value) in headers {
    request = request.header(key, value);
  }

  match request.send().await {
    Ok(response) => {
      let status = response.status().as_u16();
      match response.text().await {
        Ok(t) => {
          Ok((status, t))
        },
        Err(e) => {
          Err((status, e.to_string()))
        }
      }

    },
    Err(e) => {
      Err((e.status().unwrap_or(StatusCode::from_u16(408).unwrap()).as_u16(), e.to_string()))
    }
  }


  //let mut res = HashMap::new();
  //res.insert("status", response.status().as_str());
  // res.insert("text", response.text().clone());
  // res.insert("cookies", response.cookies());


}
