#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]
use tauri::{Manager, UserAttentionType};
use app::menu;
use app::tray::{self, SystemTrayEvent};
use app::{code_snippet};

#[tauri::command]
fn code_snippet_handle(input_text: String, replace_content: String) -> Result<(), &'static str> {
  code_snippet::handle_user_input(input_text, replace_content)
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

      let main_window = app.get_window("main").unwrap();
      let window_clone = main_window.clone();
      let _listen = std::thread::spawn(move || {
        code_snippet::watch(move |input_text: String| {
          window_clone.emit("CODE_SNIPPET_INPUT_TEXT", input_text).unwrap();
        });
      });

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![code_snippet_handle])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}