use std::time::Duration;
use tauri::Emitter;

#[derive(Clone, serde::Serialize)]
struct NetworkStatusPayload {
    online: bool,
}

fn check_online_status() -> bool {
    std::net::TcpStream::connect("1.1.1.1:53").is_ok()
        || std::net::TcpStream::connect("8.8.8.8:53").is_ok()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            app.emit("single-instance", argv).unwrap();
        }))
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let mut is_online = check_online_status();

                app_handle
                    .emit(
                        "network-status-changed",
                        NetworkStatusPayload { online: is_online },
                    )
                    .unwrap();

                loop {
                    tokio::time::sleep(Duration::from_secs(10)).await;
                    let current_status = check_online_status();

                    if current_status != is_online {
                        is_online = current_status;
                        app_handle
                            .emit(
                                "network-status-changed",
                                NetworkStatusPayload { online: is_online },
                            )
                            .unwrap();
                    }
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
