export default {
  confirmOpenSettingsAccessMediaLocationNotAllowed: {
    title: "Доступ к медиа не разрешен",
    message:
      'Доступ к медиа или местоположению медиа не разрешен; пожалуйста, откройте настройки приложения и предоставьте разрешения для доступа к "Фотографиям и Видео"\n(выберите "Всегда разрешать все", если не хотите больше видеть это сообщение с подтверждением)',
  },
  errorRequestingPermission:
    "Ошибка при запросе разрешения {{permission}}: {{details}}",
  permissionDenied: "Разрешение {{permission}} отклонено",
  permissionRequest: {
    title: "Разрешение {{permission}}",
    message: "$t(common:appTitle) требуется разрешение {{permission}}",
  },
  types: {
    accessMediaLocation: "Доступ к местоположению медиа",
    mediaLibrary: "Медиатека",
    camera: "Доступ к камере",
  },
};
