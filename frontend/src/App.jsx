
import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  window.APP_CONFIG?.API_BASE_URL ||
  "http://localhost:5000";

const STATUSES = [
  "Đang sử dụng",
  "Hư hỏng",
  "Đang sửa chữa",
  "Ngừng sử dụng"
];

const emptyForm = {
  deviceId: "",
  name: "",
  deviceType: "",
  room: "",
  brand: "",
  model: "",
  quantity: 1,
  status: "Đang sử dụng",
  purchaseDate: "",
  description: ""
};

async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
  } catch {
    throw new Error(
      "Không kết nối được Backend. Kiểm tra cổng 5000 và CORS."
    );
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message || `Lỗi HTTP ${response.status}`
    );
  }

  return result;
}

function App() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);

  async function loadDevices(keyword = "") {
    setLoading(true);
    setError("");

    try {
      const query = keyword
        ? `?search=${encodeURIComponent(keyword)}`
        : "";

      const result = await apiRequest(`/api/devices${query}`);
      setDevices(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function initialLoad() {
      try {
        const result = await apiRequest("/api/devices");
        if (active) {
          setDevices(Array.isArray(result) ? result : []);
        }
      } catch (err) {
        if (active) setError(err.message);
      }
    }

    initialLoad();
    return () => { active = false; };
  }, []);

  function openAdd() {
    setForm({ ...emptyForm });
    setSelected(null);
    setError("");
    setMode("add");
  }

  function openEdit(device) {
    setSelected(device);
    setForm({
      deviceId: device.deviceId || "",
      name: device.name || "",
      deviceType: device.deviceType || "",
      room: device.room || "",
      brand: device.brand || "",
      model: device.model || "",
      quantity: device.quantity ?? 1,
      status: device.status || "Đang sử dụng",
      purchaseDate: device.purchaseDate
        ? device.purchaseDate.slice(0, 10)
        : "",
      description: device.description || ""
    });
    setError("");
    setMode("edit");
  }

  async function openDetail(device) {
    setError("");

    try {
      const detail = await apiRequest(
        `/api/devices/${device._id}`
      );
      setSelected(detail);
      setMode("detail");
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveDevice(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity)
      };

      if (mode === "add") {
        await apiRequest("/api/devices", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        setNotice("Thêm thiết bị thành công!");
      } else {
        await apiRequest(`/api/devices/${selected._id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        setNotice("Cập nhật thiết bị thành công!");
      }

      setMode("");
      await loadDevices(search);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteDevice(device) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa ${device.name} (${device.deviceId})?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await apiRequest(`/api/devices/${device._id}`, {
        method: "DELETE"
      });

      setNotice("Xóa thiết bị thành công!");
      setMode("");
      await loadDevices(search);
    } catch (err) {
      setError(err.message);
    }
  }

  const totalQuantity = devices.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const needsAttention = devices.filter(
    item => ["Hư hỏng", "Đang sửa chữa"].includes(item.status)
  ).length;

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>QUẢN LÝ THIẾT BỊ PHÒNG HỌC</h1>
          <p>Hệ thống quản lý thiết bị trên nền tảng đám mây</p>
        </div>
        <div className="student">
          <strong>Ngô Tuấn Kiệt</strong>
          <span>MSSV: 234672</span>
        </div>
      </header>

      <main className="container">
        <div className="heading">
          <div>
            <h2>Danh sách thiết bị</h2>
            <p>Quản lý và theo dõi tình trạng thiết bị</p>
          </div>
          <button onClick={openAdd} className="primary">
            + Thêm thiết bị
          </button>
        </div>

        <section className="stats">
          <article className="stat">
            <span>Số loại thiết bị</span>
            <strong>{devices.length}</strong>
          </article>
          <article className="stat">
            <span>Tổng số lượng</span>
            <strong>{totalQuantity}</strong>
          </article>
          <article className="stat">
            <span>Thiết bị cần xử lý</span>
            <strong>{needsAttention}</strong>
          </article>
        </section>

        {notice && (
          <div className="message success">{notice}</div>
        )}
        {error && (
          <div className="message error">{error}</div>
        )}

        <section className="panel">
          <form
            className="search-bar"
            onSubmit={event => {
              event.preventDefault();
              loadDevices(search);
            }}
          >
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Tìm mã, tên, loại thiết bị hoặc phòng học..."
            />
            <button type="submit" disabled={loading}>
              Tìm kiếm
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setSearch("");
                loadDevices("");
              }}
            >
              Làm mới
            </button>
          </form>

          {loading ? (
            <p className="empty">Đang tải dữ liệu...</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã thiết bị</th>
                    <th>Tên thiết bị</th>
                    <th>Loại</th>
                    <th>Phòng</th>
                    <th>Số lượng</th>
                    <th>Tình trạng</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map(device => (
                    <tr key={device._id}>
                      <td>{device.deviceId}</td>
                      <td>{device.name}</td>
                      <td>{device.deviceType}</td>
                      <td>{device.room}</td>
                      <td>{device.quantity}</td>
                      <td>
                        <span className={
                          "status " +
                          (device.status === "Đang sử dụng"
                            ? "active" : "attention")
                        }>
                          {device.status}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            onClick={() => openDetail(device)}
                          >
                            Xem
                          </button>
                          <button
                            onClick={() => openEdit(device)}
                          >
                            Sửa
                          </button>
                          <button
                            className="danger"
                            onClick={() => deleteDevice(device)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {devices.length === 0 && (
                <p className="empty">
                  Không tìm thấy thiết bị nào.
                </p>
              )}
            </div>
          )}
        </section>
      </main>

      {mode && (
        <div className="overlay" onClick={() => setMode("")}>
          <div
            className="modal"
            onClick={event => event.stopPropagation()}
          >
            <div className="modal-head">
              <h2>
                {mode === "add" && "Thêm thiết bị"}
                {mode === "edit" && "Cập nhật thiết bị"}
                {mode === "detail" && "Chi tiết thiết bị"}
              </h2>
              <button
                className="secondary"
                onClick={() => setMode("")}
              >
                Đóng
              </button>
            </div>

            {mode === "detail" ? (
              <div className="details">
                {Object.entries({
                  "Mã thiết bị": selected.deviceId,
                  "Tên thiết bị": selected.name,
                  "Loại": selected.deviceType,
                  "Phòng": selected.room,
                  "Hãng": selected.brand,
                  "Model": selected.model,
                  "Số lượng": selected.quantity,
                  "Tình trạng": selected.status,
                  "Ngày mua": selected.purchaseDate
                    ?.slice(0, 10) || "",
                  "Mô tả": selected.description
                }).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}</strong>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={saveDevice}>
                <div className="form-grid">
                  {[
                    ["deviceId", "Mã thiết bị"],
                    ["name", "Tên thiết bị"],
                    ["deviceType", "Loại thiết bị"],
                    ["room", "Phòng học"],
                    ["brand", "Hãng sản xuất"],
                    ["model", "Model thiết bị"]
                  ].map(([field, label]) => (
                    <label key={field}>
                      {label}
                      <input
                        required
                        value={form[field]}
                        onChange={e => setForm({
                          ...form,
                          [field]: e.target.value
                        })}
                      />
                    </label>
                  ))}

                  <label>
                    Số lượng
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={form.quantity}
                      onChange={e => setForm({
                        ...form,
                        quantity: e.target.value
                      })}
                    />
                  </label>

                  <label>
                    Ngày mua
                    <input
                      type="date"
                      required
                      value={form.purchaseDate}
                      onChange={e => setForm({
                        ...form,
                        purchaseDate: e.target.value
                      })}
                    />
                  </label>

                  <label>
                    Tình trạng
                    <select
                      value={form.status}
                      onChange={e => setForm({
                        ...form,
                        status: e.target.value
                      })}
                    >
                      {STATUSES.map(status => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </label>

                  <label className="full">
                    Mô tả
                    <textarea
                      rows="3"
                      value={form.description}
                      onChange={e => setForm({
                        ...form,
                        description: e.target.value
                      })}
                    />
                  </label>
                </div>

                {error && (
                  <p className="message error">{error}</p>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => setMode("")}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="primary"
                    disabled={saving}
                  >
                    {saving ? "Đang lưu..." : "Lưu thiết bị"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
