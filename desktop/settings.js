const api = window.habitMosaicDesktop;
const byId = (id) => document.getElementById(id);

const fields = {
  apiKey: byId('apiKey'),
  model: byId('model'),
  launchAtLogin: byId('launchAtLogin'),
  startMinimized: byId('startMinimized'),
  minimizeToTray: byId('minimizeToTray'),
  closeToTray: byId('closeToTray'),
};

let clearApiKey = false;

function setMessage(text, type = '') {
  const message = byId('message');
  message.textContent = text || '';
  message.className = `message ${text ? 'visible' : ''} ${type}`.trim();
}

function setBusy(button, busy, busyText, normalText) {
  button.disabled = busy;
  button.textContent = busy ? busyText : normalText;
}

async function load() {
  const currentSettings = await api.getSettings();
  fields.model.value = currentSettings.model || 'gemini-3.5-flash';
  fields.launchAtLogin.checked = currentSettings.launchAtLogin;
  fields.startMinimized.checked = currentSettings.startMinimized;
  fields.minimizeToTray.checked = currentSettings.minimizeToTray;
  fields.closeToTray.checked = currentSettings.closeToTray;
  if (currentSettings.persistence) { byId('persistenceStatus').textContent = `Backend: ${currentSettings.persistence.backend} · ${currentSettings.persistence.databasePath}`; }
  byId('keyStatus').textContent = currentSettings.hasApiKey
    ? `Đã lưu API key${currentSettings.encryptionAvailable ? ' và mã hóa bằng Windows' : ''}. Chỉ nhập lại khi muốn thay thế.`
    : 'Chưa có API key. Các tính năng AI sẽ dùng nội dung dự phòng khi cần.';
}

byId('toggleKey').addEventListener('click', () => {
  const showing = fields.apiKey.type === 'text';
  fields.apiKey.type = showing ? 'password' : 'text';
  byId('toggleKey').textContent = showing ? 'Hiện' : 'Ẩn';
});

byId('openAiStudio').addEventListener('click', () => api.openAiStudio());
byId('showApp').addEventListener('click', () => api.showApp());
byId('backupNow').addEventListener('click', async () => { const result = await api.createDataBackup(); setMessage(result?.ok ? `Đã tạo backup: ${result.path}` : 'Không tạo được backup.', result?.ok ? 'ok' : 'error'); });
byId('openDataFolder').addEventListener('click', () => api.openDataFolder());

byId('clearKey').addEventListener('click', () => {
  clearApiKey = true;
  fields.apiKey.value = '';
  byId('keyStatus').textContent = 'API key sẽ được xóa khi bạn bấm Lưu cài đặt.';
  setMessage('Nhấn “Lưu cài đặt” để xác nhận xóa khóa.', 'error');
});

byId('testKey').addEventListener('click', async () => {
  const button = byId('testKey');
  const key = fields.apiKey.value.trim();
  if (!key) {
    setMessage('Để kiểm tra, hãy dán API key mới vào ô phía trên.', 'error');
    return;
  }
  setBusy(button, true, 'Đang kiểm tra…', 'Kiểm tra kết nối');
  setMessage('Đang gọi thử Google Gemini…');
  try {
    const result = await api.testApiKey({ apiKey: key, model: fields.model.value });
    setMessage(result.message, result.ok ? 'ok' : 'error');
  } finally {
    setBusy(button, false, 'Đang kiểm tra…', 'Kiểm tra kết nối');
  }
});

byId('save').addEventListener('click', async () => {
  const button = byId('save');
  setBusy(button, true, 'Đang lưu…', 'Lưu cài đặt');
  setMessage('Đang lưu cấu hình…');

  try {
    const result = await api.saveSettings({
      apiKey: fields.apiKey.value.trim(),
      clearApiKey,
      model: fields.model.value,
      launchAtLogin: fields.launchAtLogin.checked,
      startMinimized: fields.startMinimized.checked,
      minimizeToTray: fields.minimizeToTray.checked,
      closeToTray: fields.closeToTray.checked,
    });
    if (!result || !result.ok) throw new Error('Không lưu được cấu hình.');
    clearApiKey = false;
    fields.apiKey.value = '';
    byId('keyStatus').textContent = result.settings.hasApiKey
      ? 'Đã lưu API key. Không cần khởi động lại máy chủ.'
      : 'Hiện không có API key đã lưu.';
    setMessage('Đã lưu và áp dụng ngay. Bản V12 không dùng máy chủ/cổng nội bộ.', 'ok');
  } catch (error) {
    setMessage(error.message || String(error), 'error');
  } finally {
    setBusy(button, false, 'Đang lưu…', 'Lưu cài đặt');
  }
});

load().catch((error) => setMessage(`Không đọc được cài đặt: ${error.message}`, 'error'));
