#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]
use tauri::{Manager, UserAttentionType};
use app::menu;
use app::tray::{self, SystemTrayEvent};
use app::{code_snippet, http, clipboard};

#[tauri::command]
fn code_snippet_handler(input_text: String, replace_content: String) -> Result<(), &'static str> {
  code_snippet::handle_user_input(input_text, replace_content)
}


#[tauri::command]
fn update_http_config_rules_handler(rules: Vec<http::config::ConfigRule>) -> Result<(), &'static str> {
  let mut config = http::CONFIG.lock().unwrap();
    (*config).rules = rules;
    Ok(())
}
#[tauri::command]
async fn start_http_server_handler(port: u16) -> Result<(), &'static str> {
  println!("Starting http server..{}.", port);
  {
    let mut config = http::CONFIG.lock().unwrap();
    (*config).port = port;
  }
  match http::listen(port).await {
    Ok(()) => {
      Ok(())
    },
    Err(e) => {
      Err(e)
    }
  }
}

#[tauri::command]
fn write_text_to_clipboard(text: String) -> Result<(), &'static str> {
    let mut clipboard = clipboard::Clipboard::new();
    if let Ok(_) = clipboard.set_text(&text) {
        return Ok(())
    }
    Err("")
}
#[tauri::command]
fn write_image_to_clipboard(image: clipboard::ImageData) -> Result<(), &'static str> {
    let mut clipboard = clipboard::Clipboard::new();
    if let Ok(_) = clipboard.set_image(image) {
        return Ok(())
    }
    Err("")
}

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_sqlite::init())
    .system_tray(tray::create_system_tray())
    .on_system_tray_event(|app, event| match event {
        // https://tauri.studio/docs/guides/system-tray
        SystemTrayEvent::LeftClick {position: _, size: _, ..} => {
          let window = app.get_window("main").unwrap();
          window.show().unwrap();
          window.set_focus().unwrap();
          window.request_user_attention(Some(UserAttentionType::Critical)).unwrap();
        }
        // SystemTrayEvent::RightClick {position: _, size: _, ..} => {
        //   println!("system tray received a right click");
        // }
        SystemTrayEvent::MenuItemClick { id, .. } => {
            // let item_handle = app.tray_handle().get_item(&id);
            match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "hide" => {
                    let window = app.get_window("main").unwrap();
                    window.hide().unwrap();
                }
                // "toggle_visible" => {
                //     let window = app.get_window("main").unwrap();
                //     let new_title = if window.is_visible().unwrap() {
                //         window.hide().unwrap();
                //         "显示"
                //       } else {
                //         window.show().unwrap();
                //         "隐藏"
                //       };
                //     item_handle.set_title(new_title).unwrap();
                // }
                _ => {}
            }
        }
        _ => {}
    })
    .menu(menu::create_menu())
    .setup(|app| {
      #[cfg(target_os = "macos")]
      app.set_activation_policy(tauri::ActivationPolicy::Accessory);
      // code_snippet
      let main_window = app.get_window("main").unwrap();
      let window_clone = main_window.clone();
      let _listen = std::thread::spawn(move || {
        code_snippet::watch(move |input_text: String| {
          window_clone.emit("CODE_SNIPPET_INPUT_TEXT", input_text).unwrap();
        });
      });
      // clipboard
      let main_window = app.get_window("main").unwrap();
      let window_clone = main_window.clone();
      std::thread::spawn(move || {
        let mut clipboard = clipboard::Clipboard::new();
        clipboard.listen();
        if let Some(rx) = clipboard.rx.take() {
            for _exists_msg in rx {
                if let Ok(text) = clipboard.get_text() {
                    // println!("text: {:?}", text);
                    window_clone.emit("CLIPBOARD_VALUE", clipboard::ContentValue::Text(text)).unwrap();
                } else if let Ok(image) = clipboard.get_image() {
                    // println!("image");
                    window_clone.emit("CLIPBOARD_VALUE", clipboard::ContentValue::Image(image)).unwrap();
                }
            }
        }
      });

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      code_snippet_handler,
      update_http_config_rules_handler,
      start_http_server_handler,
      write_text_to_clipboard,
      write_image_to_clipboard,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}