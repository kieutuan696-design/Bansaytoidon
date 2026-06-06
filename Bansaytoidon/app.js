/**
 * app.js — Bạn Say Tôi Đón
 * Toàn bộ logic tương tác cho trang đặt xe lái hộ
 * Tổ chức theo từng phần của form (1→5)
 */

'use strict';

/* ================================================================
   STATE — Lưu trạng thái toàn cục của form
================================================================ */
const state = {
  // Phần 1: Lộ trình
  pickup: { address: '', lat: null, lng: null },
  dropoff: { address: '', lat: null, lng: null },

  // Phần 2: Xe
  vehicleType: '',

  // Phần 3: Liên hệ
  bookForOther: false,

  // Phần 4: Thời gian
  timeMode: 'now',          // 'now' | 'schedule'
  scheduledTime: '',
  activeNotes: [],          // mảng các ghi chú nhanh đã chọn

  // Phần 5: Thanh toán
  paymentMethod: '',
  couponCode: '',
  discountPercent: 0,

  // Giá cước (VNĐ)
  pricing: {
    basePricePerKm: 15000,  // 15.000đ/km (xe máy)
    carSurcharge:   1.5,    // x1.5 cho ô tô
    luxurySurcharge: 2.5,   // x2.5 cho xe sang
    minimumFee:     30000,  // Tối thiểu 30.000đ
  },

  // Google Maps objects
  autocompletePickup: null,
  autocompleteDropoff: null,
  map: null,
  directionsService: null,
  directionsRenderer: null,

  // User session giả lập
  user: JSON.parse(localStorage.getItem('bstd_user') || 'null'),

  // Địa điểm yêu thích đã lưu
  favoritePlaces: JSON.parse(localStorage.getItem('bstd_places') || '{"home":null,"work":null}'),

  // Mã giảm giá hợp lệ (demo)
  validCoupons: {
    'SAYGIAM50': { desc: 'Giảm 50%', discount: 50 },
    'NHAUUI20':  { desc: 'Giảm 20%', discount: 20 },
    'FIRSTRIDE': { desc: 'Giảm 30% chuyến đầu', discount: 30 },
    'BSTVIP':    { desc: 'VIP - Giảm 40%', discount: 40 },
  },

  currentStep: 1,
};

/* ================================================================
   PHẦN 1: GOOGLE MAPS AUTOCOMPLETE & GPS
   Liên quan HTML: #pickupAddress, #dropoffAddress, #btnGPS
   Liên quan CSS:  .address-input, .btn-gps, .gps-loading, .map-preview
================================================================ */

/**
 * initAutocomplete()
 * Callback được Google Maps API gọi sau khi load xong script
 * Gắn Google Places Autocomplete vào 2 ô địa chỉ
 * HTML: input#pickupAddress, input#dropoffAddress
 */
function initAutocomplete() {
  const pickupInput   = document.getElementById('pickupAddress');
  const dropoffInput  = document.getElementById('dropoffAddress');

  // Cấu hình giới hạn gợi ý trong Việt Nam
  const options = {
    componentRestrictions: { country: 'vn' },
    fields: ['formatted_address', 'geometry', 'name'],
  };

  // Tạo Autocomplete cho ô đón
  state.autocompletePickup = new google.maps.places.Autocomplete(pickupInput, options);
  state.autocompletePickup.addListener('place_changed', () => {
    const place = state.autocompletePickup.getPlace();
    if (place.geometry) {
      state.pickup.address = place.formatted_address || place.name;
      state.pickup.lat     = place.geometry.location.lat();
      state.pickup.lng     = place.geometry.location.lng();
      tryShowRoutePreview();
    }
  });

  // Tạo Autocomplete cho ô đến
  state.autocompleteDropoff = new google.maps.places.Autocomplete(dropoffInput, options);
  state.autocompleteDropoff.addListener('place_changed', () => {
    const place = state.autocompleteDropoff.getPlace();
    if (place.geometry) {
      state.dropoff.address = place.formatted_address || place.name;
      state.dropoff.lat     = place.geometry.location.lat();
      state.dropoff.lng     = place.geometry.location.lng();
      tryShowRoutePreview();
    }
  });

  // Khởi tạo Google Map ẩn (sẽ hiện khi có cả 2 địa điểm)
  initMap();

  // Điền sẵn SĐT nếu đã đăng nhập
  prefillPhone();

  // Render địa điểm yêu thích
  renderFavoritePlaces();

  // Render danh sách coupon demo
  renderCoupons();
}

/**
 * initMap()
 * Khởi tạo Google Map + DirectionsService/Renderer ẩn trong #googleMap
 * HTML: div#googleMap
 */
function initMap() {
  // Trung tâm mặc định: Hà Nội
  const hanoi = { lat: 21.0285, lng: 105.8542 };

  state.map = new google.maps.Map(document.getElementById('googleMap'), {
    center: hanoi,
    zoom: 13,
    styles: nightMapStyles(), // Style bản đồ tối (xem cuối file)
    disableDefaultUI: true,
    zoomControl: true,
  });

  state.directionsService  = new google.maps.DirectionsService();
  state.directionsRenderer = new google.maps.DirectionsRenderer({
    map: state.map,
    suppressMarkers: false,
    polylineOptions: {
      strokeColor: '#f5a623',
      strokeWeight: 5,
      strokeOpacity: 0.9,
    },
  });
}

/**
 * getGPSLocation()
 * Lấy vị trí GPS hiện tại của thiết bị và điền vào ô đón
 * HTML: button#btnGPS → gọi hàm này qua onclick
 * CSS: .gps-loading (spinner hiện khi đang lấy GPS)
 */
function getGPSLocation() {
  if (!navigator.geolocation) {
    showToast('Trình duyệt không hỗ trợ định vị 😢', 'error');
    return;
  }

  toggleGPSLoading(true);

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      state.pickup.lat = latitude;
      state.pickup.lng = longitude;

      // Reverse geocode: tọa độ → địa chỉ văn bản
      reverseGeocode(latitude, longitude, (address) => {
        state.pickup.address = address;
        document.getElementById('pickupAddress').value = address;
        toggleGPSLoading(false);
        showToast('📍 Đã lấy vị trí hiện tại!', 'success');
        tryShowRoutePreview();
      });
    },
    (err) => {
      toggleGPSLoading(false);
      showToast('Không thể lấy vị trí. Vui lòng nhập thủ công 📝', 'error');
      console.warn('GPS error:', err);
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

/**
 * reverseGeocode(lat, lng, callback)
 * Chuyển tọa độ → địa chỉ văn bản qua Google Geocoder
 * @param {number} lat
 * @param {number} lng
 * @param {function} callback — nhận (addressString)
 */
function reverseGeocode(lat, lng, callback) {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ location: { lat, lng } }, (results, status) => {
    if (status === 'OK' && results[0]) {
      callback(results[0].formatted_address);
    } else {
      callback(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
  });
}

/**
 * toggleGPSLoading(isLoading)
 * Hiện/ẩn spinner GPS
 * HTML: div#gpsLoading
 * CSS: .gps-loading, .hidden
 * @param {boolean} isLoading
 */
function toggleGPSLoading(isLoading) {
  const el = document.getElementById('gpsLoading');
  el.classList.toggle('hidden', !isLoading);
  document.getElementById('btnGPS').disabled = isLoading;
}

/**
 * tryShowRoutePreview()
 * Hiện preview bản đồ nếu cả 2 điểm đã có dữ liệu
 * HTML: div#mapPreview
 * CSS: .map-preview, .hidden
 */
function tryShowRoutePreview() {
  if (!state.pickup.lat || !state.dropoff.lat) return;

  document.getElementById('mapPreview').classList.remove('hidden');

  // Lấy directions từ Google Maps
  state.directionsService.route(
    {
      origin:      { lat: state.pickup.lat,   lng: state.pickup.lng   },
      destination: { lat: state.dropoff.lat,  lng: state.dropoff.lng  },
      travelMode:  google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === 'OK') {
        state.directionsRenderer.setDirections(result);

        const leg = result.routes[0].legs[0];
        const distanceKm = (leg.distance.value / 1000).toFixed(1);
        const durationMin = Math.ceil(leg.duration.value / 60);

        // Cập nhật thông tin lộ trình + tính giá
        updateRouteInfo(parseFloat(distanceKm), durationMin);
      }
    }
  );
}

/**
 * updateRouteInfo(km, minutes)
 * Hiện khoảng cách, thời gian, giá ước tính trên route bar
 * HTML: #routeDistance, #routeTime, #routePrice
 * CSS: .route-info-bar, .price-stat
 * @param {number} km
 * @param {number} minutes
 */
function updateRouteInfo(km, minutes) {
  document.getElementById('routeDistance').textContent = km;
  document.getElementById('routeTime').textContent     = minutes;

  const price = calculatePrice(km);
  document.getElementById('routePrice').textContent = formatVND(price);

  // Cập nhật bảng tổng giá cuối form
  updatePriceSummary(km);
}

/* ================================================================
   PHẦN 2: CHỌN LOẠI XE
   HTML: .vehicle-grid, input#vehicleType
   CSS:  .vehicle-card, .vehicle-card.selected
================================================================ */

/**
 * selectVehicle(type, el)
 * Chọn loại xe, đánh dấu card selected, lưu vào state
 * HTML: div.vehicle-card onclick="selectVehicle(...)"
 * CSS:  .vehicle-card.selected
 * @param {string} type  — loại xe (vd: 'car-luxury')
 * @param {Element} el   — element card được click
 */
function selectVehicle(type, el) {
  // Bỏ selected tất cả cards cũ
  document.querySelectorAll('.vehicle-card').forEach(c => c.classList.remove('selected'));

  // Thêm selected cho card mới
  el.classList.add('selected');

  // Lưu vào state và hidden input
  state.vehicleType = type;
  document.getElementById('vehicleType').value = type;

  // Cập nhật bảng giá (vì giá thay đổi theo xe)
  const km = parseRouteDistance();
  if (km > 0) updatePriceSummary(km);

  // Cập nhật step bar
  updateStepBar(2);
}

/* ================================================================
   PHẦN 3: THÔNG TIN LIÊN HỆ
   HTML: #phoneNumber, #bookForOther, #otherPersonFields
   CSS:  .other-person-fields, .hidden
================================================================ */

/**
 * prefillPhone()
 * Tự điền SĐT nếu user đã đăng nhập (state.user)
 * HTML: input#phoneNumber
 */
function prefillPhone() {
  if (state.user && state.user.phone) {
    document.getElementById('phoneNumber').value = state.user.phone;
  }
}

/**
 * toggleBookForOther(checked)
 * Hiện/ẩn các ô nhập cho người được đặt hộ
 * HTML: input#bookForOther (checkbox) → onchange gọi hàm này
 * CSS:  .other-person-fields, .hidden
 * @param {boolean} checked
 */
function toggleBookForOther(checked) {
  state.bookForOther = checked;
  const fields = document.getElementById('otherPersonFields');
  fields.classList.toggle('hidden', !checked);

  // Slide animation: set max-height động
  if (checked) {
    fields.style.maxHeight = fields.scrollHeight + 'px';
  } else {
    fields.style.maxHeight = '0';
  }
}

/* ================================================================
   PHẦN 4: THỜI GIAN & GHI CHÚ
   HTML: .time-tabs, #schedulePicker, #driverNote, .quick-note-btn
   CSS:  .time-tab.active, .schedule-picker, .quick-note-btn.active
================================================================ */

/**
 * switchTimeMode(mode)
 * Chuyển giữa "Đón ngay" và "Đặt lịch trước"
 * HTML: button.time-tab onclick="switchTimeMode(...)"
 * CSS:  .time-tab.active, .schedule-picker, .hidden
 * @param {string} mode — 'now' | 'schedule'
 */
function switchTimeMode(mode) {
  state.timeMode = mode;

  // Toggle active class giữa 2 tab
  document.getElementById('tabNow').classList.toggle('active', mode === 'now');
  document.getElementById('tabSchedule').classList.toggle('active', mode === 'schedule');

  // Hiện/ẩn date-time picker
  const picker = document.getElementById('schedulePicker');
  if (mode === 'schedule') {
    picker.classList.remove('hidden');
    picker.style.maxHeight = '100px';
    // Mặc định giờ đặt lịch = 1 giờ sau hiện tại
    const d = new Date(Date.now() + 3600000);
    document.getElementById('scheduledTime').value = toLocalDatetimeInput(d);
  } else {
    picker.classList.add('hidden');
    picker.style.maxHeight = '0';
  }
}

/**
 * toLocalDatetimeInput(date)
 * Convert Date → chuỗi "YYYY-MM-DDTHH:MM" phù hợp input[type=datetime-local]
 * @param {Date} date
 * @returns {string}
 */
function toLocalDatetimeInput(date) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * toggleQuickNote(btn, text)
 * Bật/tắt một ghi chú nhanh, đồng bộ vào textarea
 * HTML: button.quick-note-btn onclick="toggleQuickNote(this, '...')"
 * CSS:  .quick-note-btn.active
 * @param {Element} btn  — nút được click
 * @param {string}  text — nội dung ghi chú tương ứng
 */
function toggleQuickNote(btn, text) {
  const isActive = btn.classList.toggle('active');

  if (isActive) {
    // Thêm ghi chú vào mảng state
    if (!state.activeNotes.includes(text)) {
      state.activeNotes.push(text);
    }
  } else {
    // Xóa ghi chú khỏi mảng state
    state.activeNotes = state.activeNotes.filter(n => n !== text);
  }

  // Cập nhật nội dung textarea từ mảng
  syncNoteTextarea();
}

/**
 * syncNoteTextarea()
 * Cập nhật textarea #driverNote từ state.activeNotes
 * HTML: textarea#driverNote
 */
function syncNoteTextarea() {
  const existing = document.getElementById('driverNote').value;
  // Giữ phần gõ tay của user, thêm ghi chú nhanh vào trước
  const quickPart = state.activeNotes.join('. ');
  // Tách phần text thủ công (không phải ghi chú nhanh)
  const allQuick = Array.from(document.querySelectorAll('.quick-note-btn')).map(b => b.getAttribute('onclick').match(/'([^']+)'/g)?.[1]?.replace(/'/g, '') || '');
  const manualPart = existing.split('. ').filter(line => !allQuick.some(q => line.includes(q.replace(/'/g,'')))).join('. ');
  document.getElementById('driverNote').value = [quickPart, manualPart].filter(Boolean).join('. ');
}

/* ================================================================
   PHẦN 5: THANH TOÁN & ƯU ĐÃI
   HTML: .payment-grid, #couponCode, #couponResult
   CSS:  .payment-option.selected, .coupon-result.success/error
================================================================ */

/**
 * selectPayment(method, el)
 * Chọn phương thức thanh toán
 * HTML: div.payment-option onclick="selectPayment(...)"
 * CSS:  .payment-option.selected
 * @param {string}  method — tên phương thức
 * @param {Element} el     — element được click
 */
function selectPayment(method, el) {
  document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  state.paymentMethod = method;
  document.getElementById('paymentMethod').value = method;
  updateStepBar(5);
}

/**
 * applyCoupon()
 * Kiểm tra mã giảm giá và áp dụng
 * HTML: button.btn-apply onclick="applyCoupon()"
 * CSS:  .coupon-result.success, .coupon-result.error
 */
function applyCoupon() {
  const code    = document.getElementById('couponCode').value.trim().toUpperCase();
  const coupon  = state.validCoupons[code];

  if (!code) {
    showCouponResult('Vui lòng nhập mã giảm giá', 'error');
    return;
  }

  if (coupon) {
    state.couponCode      = code;
    state.discountPercent = coupon.discount;
    showCouponResult(`🎉 Áp dụng thành công! ${coupon.desc}`, 'success');
    const km = parseRouteDistance();
    updatePriceSummary(km > 0 ? km : 0);
  } else {
    state.couponCode      = '';
    state.discountPercent = 0;
    showCouponResult('Mã không hợp lệ hoặc đã hết hạn 😞', 'error');
  }
}

/**
 * showCouponResult(msg, type)
 * Hiện thông báo kết quả coupon
 * HTML: div#couponResult
 * CSS:  .coupon-result, .coupon-result.success, .coupon-result.error, .hidden
 * @param {string} msg
 * @param {string} type — 'success' | 'error'
 */
function showCouponResult(msg, type) {
  const el = document.getElementById('couponResult');
  el.textContent = msg;
  el.className   = `coupon-result ${type}`;
}

/* ================================================================
   TÍNH GIÁ
================================================================ */

/**
 * calculatePrice(km)
 * Tính giá cước dựa trên khoảng cách + loại xe
 * @param {number} km
 * @returns {number} giá VNĐ
 */
function calculatePrice(km) {
  const { basePricePerKm, carSurcharge, luxurySurcharge, minimumFee } = state.pricing;
  let multiplier = 1;

  if (state.vehicleType.startsWith('car-luxury')) {
    multiplier = luxurySurcharge;
  } else if (state.vehicleType.startsWith('car-')) {
    multiplier = carSurcharge;
  } else if (state.vehicleType === 'motorbike-big') {
    multiplier = 1.2;
  }

  const raw = Math.max(minimumFee, km * basePricePerKm * multiplier);
  return Math.round(raw / 1000) * 1000; // Làm tròn 1000đ
}

/**
 * updatePriceSummary(km)
 * Cập nhật bảng tổng kết giá trong phần 5
 * HTML: #basePrice, #surcharge, #discountRow, #discountAmount, #totalPrice
 * CSS:  .price-summary, .discount-row, .hidden
 * @param {number} km
 */
function updatePriceSummary(km) {
  if (!km || km <= 0) return;

  const base     = calculatePrice(km);
  let   surcharge = 0;

  if (state.vehicleType.startsWith('car-luxury')) {
    surcharge = Math.round(base * 0.4 / 1000) * 1000;
  } else if (state.vehicleType.startsWith('car-')) {
    surcharge = Math.round(base * 0.2 / 1000) * 1000;
  }

  const subtotal      = base;
  let   discount      = 0;
  let   total         = subtotal;

  if (state.discountPercent > 0) {
    discount = Math.round(subtotal * (state.discountPercent / 100) / 1000) * 1000;
    total    = subtotal - discount;
  }

  document.getElementById('basePrice').textContent     = formatVND(base - surcharge);
  document.getElementById('surcharge').textContent     = surcharge > 0 ? formatVND(surcharge) : '0đ';

  const discountRow = document.getElementById('discountRow');
  if (discount > 0) {
    discountRow.classList.remove('hidden');
    document.getElementById('discountAmount').textContent = '-' + formatVND(discount);
  } else {
    discountRow.classList.add('hidden');
  }

  document.getElementById('totalPrice').textContent = formatVND(total);
}

/**
 * parseRouteDistance()
 * Đọc khoảng cách hiện tại từ DOM (nếu đã có preview)
 * @returns {number} km hoặc 0
 */
function parseRouteDistance() {
  const distEl = document.getElementById('routeDistance');
  return distEl ? parseFloat(distEl.textContent) || 0 : 0;
}

/* ================================================================
   MODAL — Danh sách coupon
   HTML: #couponModal, #couponList
   CSS:  .modal-overlay, .modal-box, .coupon-item, .hidden
================================================================ */

/**
 * renderCoupons()
 * Render danh sách coupon demo vào modal
 * HTML: div#couponList
 * CSS:  .coupon-item, .coupon-code, .coupon-desc
 */
function renderCoupons() {
  const list = document.getElementById('couponList');
  list.innerHTML = '';

  Object.entries(state.validCoupons).forEach(([code, info]) => {
    const item = document.createElement('div');
    item.className = 'coupon-item';
    item.innerHTML = `
      <div>
        <div class="coupon-code">${code}</div>
        <div class="coupon-desc">${info.desc}</div>
      </div>
      <span style="color:var(--accent);font-weight:700;">-${info.discount}%</span>
    `;
    item.onclick = () => selectCouponFromList(code);
    list.appendChild(item);
  });
}

/**
 * openCouponModal()
 * Mở modal danh sách coupon
 * HTML: div#couponModal
 * CSS:  .modal-overlay, .hidden
 */
function openCouponModal() {
  document.getElementById('couponModal').classList.remove('hidden');
}

/**
 * closeCouponModal(event?)
 * Đóng modal coupon (click backdrop hoặc nút ✕)
 * HTML: div#couponModal, button.modal-close
 * @param {Event} [event]
 */
function closeCouponModal(event) {
  // Chỉ đóng nếu click vào overlay (không phải nội dung bên trong)
  if (!event || event.target === event.currentTarget) {
    document.getElementById('couponModal').classList.add('hidden');
  }
}

/**
 * selectCouponFromList(code)
 * Chọn coupon từ danh sách, điền vào input và áp dụng
 * HTML: input#couponCode
 * @param {string} code
 */
function selectCouponFromList(code) {
  document.getElementById('couponCode').value = code;
  closeCouponModal();
  applyCoupon();
}

/* ================================================================
   MODAL — Địa điểm yêu thích
   HTML: #savePlaceModal
   CSS:  .modal-overlay, .hidden
================================================================ */

/**
 * openSavePlaceModal()
 * Mở modal lưu địa điểm yêu thích
 */
function openSavePlaceModal() {
  document.getElementById('savePlaceModal').classList.remove('hidden');
}

/**
 * closeSavePlaceModal(event?)
 * Đóng modal lưu địa điểm
 */
function closeSavePlaceModal(event) {
  if (!event || event.target === event.currentTarget) {
    document.getElementById('savePlaceModal').classList.add('hidden');
  }
}

/**
 * saveFavoritePlace()
 * Lưu địa điểm yêu thích mới từ modal vào localStorage
 * HTML: input#placeLabel, input#placeAddress
 */
function saveFavoritePlace() {
  const label   = document.getElementById('placeLabel').value.trim();
  const address = document.getElementById('placeAddress').value.trim();

  if (!label || !address) {
    showToast('Vui lòng nhập đủ thông tin 📝', 'error');
    return;
  }

  // Lưu vào localStorage với key = label slug
  const key = label.toLowerCase().replace(/\s+/g, '_');
  state.favoritePlaces[key] = { label, address };
  localStorage.setItem('bstd_places', JSON.stringify(state.favoritePlaces));

  closeSavePlaceModal();
  showToast(`✅ Đã lưu "${label}"`, 'success');
  renderFavoritePlaces();
}

/**
 * renderFavoritePlaces()
 * Render các nút địa điểm yêu thích đã lưu vào .quick-places
 * HTML: div.quick-places
 * CSS:  .quick-place-btn
 */
function renderFavoritePlaces() {
  const container = document.querySelector('.quick-places');
  // Xóa các nút cũ (trừ nút "Thêm")
  const addBtn = document.getElementById('btnSavePlace');
  const existing = container.querySelectorAll('.dynamic-place-btn');
  existing.forEach(b => b.remove());

  // Render home + work mặc định nếu có
  const defaultKeys = { home: '🏠 Về nhà', work: '🏢 Cơ quan' };
  Object.entries(defaultKeys).forEach(([key, label]) => {
    const btn = document.getElementById(key === 'home' ? 'btnHome' : 'btnWork');
    if (btn) {
      // Nếu chưa có địa chỉ → hiển thị với style khác
      const hasAddr = state.favoritePlaces[key];
      btn.style.opacity = hasAddr ? '1' : '0.5';
      btn.title = hasAddr ? state.favoritePlaces[key].address : 'Chưa có địa chỉ';
    }
  });

  // Render các địa điểm tùy chỉnh đã lưu
  Object.entries(state.favoritePlaces).forEach(([key, info]) => {
    if (!info || key === 'home' || key === 'work') return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quick-place-btn dynamic-place-btn';
    btn.textContent = `📌 ${info.label}`;
    btn.onclick = () => selectFavoritePlace(key);
    container.insertBefore(btn, addBtn);
  });
}

/**
 * selectFavoritePlace(type)
 * Điền địa chỉ yêu thích đã lưu vào ô điểm đến
 * HTML: input#dropoffAddress, button.quick-place-btn
 * CSS:  .quick-place-btn.active
 * @param {string} type — 'home' | 'work' | key tùy chỉnh
 */
function selectFavoritePlace(type) {
  const place = state.favoritePlaces[type];
  if (!place || !place.address) {
    showToast('Chưa có địa chỉ. Hãy lưu địa điểm trước! 📍', 'error');
    return;
  }

  document.getElementById('dropoffAddress').value = place.address;
  state.dropoff.address = place.address;

  // Highlight nút đang active
  document.querySelectorAll('.quick-place-btn').forEach(b => b.classList.remove('active'));
  // Tìm và active đúng nút
  const targetId = type === 'home' ? 'btnHome' : type === 'work' ? 'btnWork' : null;
  if (targetId) document.getElementById(targetId)?.classList.add('active');

  showToast(`🏁 Điểm đến: ${place.label || place.address}`, 'success');

  // Geocode địa chỉ để lấy tọa độ
  if (window.google) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: place.address, componentRestrictions: { country: 'vn' } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        state.dropoff.lat = results[0].geometry.location.lat();
        state.dropoff.lng = results[0].geometry.location.lng();
        tryShowRoutePreview();
      }
    });
  }
}

/* ================================================================
   STEP BAR — Cập nhật thanh tiến trình
   HTML: .steps-bar .step
   CSS:  .step.active, .step.done
================================================================ */

/**
 * updateStepBar(step)
 * Đánh dấu step hiện tại active, các bước trước là done
 * HTML: .step[data-step]
 * CSS:  .step.active, .step.done
 * @param {number} step — bước hiện tại (1-5)
 */
function updateStepBar(step) {
  if (step <= state.currentStep) return; // Chỉ tiến lên
  state.currentStep = step;

  document.querySelectorAll('.step').forEach(el => {
    const s = parseInt(el.dataset.step);
    el.classList.remove('active', 'done');
    if (s < step)     el.classList.add('done');
    if (s === step)   el.classList.add('active');
  });
}

/* ================================================================
   FORM SUBMIT
   HTML: form#bookingForm onsubmit="handleFormSubmit(event)"
   CSS:  .btn-submit
================================================================ */

/**
 * handleFormSubmit(event)
 * Validate và submit form đặt xe
 * HTML: form#bookingForm, button#btnSubmit
 */
function handleFormSubmit(event) {
  event.preventDefault();

  // Validate các trường bắt buộc
  if (!validateForm()) return;

  // Giả lập gọi API đặt xe
  const btn = document.getElementById('btnSubmit');
  btn.disabled = true;
  btn.querySelector('.submit-text').textContent = 'Đang đặt xe...';
  btn.querySelector('.submit-arrow').textContent = '⏳';

  // Simulate API delay
  setTimeout(() => {
    btn.disabled = false;
    btn.querySelector('.submit-text').textContent = 'ĐẶT XE NGAY';
    btn.querySelector('.submit-arrow').textContent = '→';
    showSuccessModal();
  }, 2000);
}

/**
 * validateForm()
 * Kiểm tra các trường bắt buộc trước khi submit
 * @returns {boolean}
 */
function validateForm() {
  const checks = [
    { id: 'pickupAddress',  msg: 'Vui lòng nhập điểm đón 📍' },
    { id: 'dropoffAddress', msg: 'Vui lòng nhập điểm đến 🏁' },
    { id: 'vehicleType',    msg: 'Vui lòng chọn loại xe 🚗' },
    { id: 'vehiclePlate',   msg: 'Vui lòng nhập biển số xe 🔖' },
    { id: 'phoneNumber',    msg: 'Vui lòng nhập số điện thoại 📞' },
    { id: 'paymentMethod',  msg: 'Vui lòng chọn phương thức thanh toán 💳' },
  ];

  for (const { id, msg } of checks) {
    const el = document.getElementById(id);
    if (!el || !el.value.trim()) {
      showToast(msg, 'error');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus();
      return false;
    }
  }

  // Validate SĐT: 10-11 số
  const phone = document.getElementById('phoneNumber').value.replace(/\s/g, '');
  if (!/^0\d{9,10}$/.test(phone)) {
    showToast('Số điện thoại không hợp lệ 📞', 'error');
    return false;
  }

  return true;
}

/* ================================================================
   SUCCESS MODAL
   HTML: #successModal
   CSS:  .modal-overlay, .success-modal, .hidden
================================================================ */

/**
 * showSuccessModal()
 * Hiện modal thông báo đặt xe thành công
 * HTML: div#successModal
 * CSS:  .success-modal
 */
function showSuccessModal() {
  document.getElementById('successModal').classList.remove('hidden');
}

/**
 * trackDriver()
 * Mở link theo dõi tài xế (demo)
 */
function trackDriver() {
  showToast('🗺️ Tính năng theo dõi tài xế sẽ ra mắt sớm!', 'info');
}

/**
 * resetForm()
 * Reset toàn bộ form về trạng thái ban đầu
 * HTML: form#bookingForm
 */
function resetForm() {
  document.getElementById('successModal').classList.add('hidden');
  document.getElementById('bookingForm').reset();

  // Reset state
  state.pickup         = { address: '', lat: null, lng: null };
  state.dropoff        = { address: '', lat: null, lng: null };
  state.vehicleType    = '';
  state.paymentMethod  = '';
  state.discountPercent = 0;
  state.couponCode     = '';
  state.activeNotes    = [];
  state.currentStep    = 1;

  // Reset UI
  document.querySelectorAll('.vehicle-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
  document.querySelectorAll('.quick-note-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('mapPreview').classList.add('hidden');
  document.getElementById('couponResult').classList.add('hidden');
  document.getElementById('otherPersonFields').classList.add('hidden');

  // Reset steps
  updateStepBarToStart();

  // Cuộn lên đầu
  window.scrollTo({ top: 0, behavior: 'smooth' });

  showToast('✨ Đã reset form. Đặt xe mới!', 'success');
}

/**
 * updateStepBarToStart()
 * Về lại step 1
 */
function updateStepBarToStart() {
  state.currentStep = 1;
  document.querySelectorAll('.step').forEach(el => {
    el.classList.remove('active', 'done');
    if (parseInt(el.dataset.step) === 1) el.classList.add('active');
  });
}

/* ================================================================
   MODAL — Đăng nhập (demo)
   HTML: button#btnLogin
================================================================ */

/**
 * handleLogin()
 * Xử lý đăng nhập (demo: toggle user giả)
 * HTML: button#btnLogin
 */
function handleLogin() {
  if (state.user) {
    // Đã đăng nhập → đăng xuất
    state.user = null;
    localStorage.removeItem('bstd_user');
    document.getElementById('btnLogin').innerHTML = '<span class="login-icon">👤</span><span class="login-text">Đăng nhập</span>';
    document.getElementById('phoneNumber').value = '';
    showToast('Đã đăng xuất', 'info');
  } else {
    // Chưa đăng nhập → giả lập đăng nhập demo
    state.user = { name: 'Nguyễn Văn Say', phone: '0912345678' };
    localStorage.setItem('bstd_user', JSON.stringify(state.user));
    document.getElementById('btnLogin').innerHTML = `<span class="login-icon">😄</span><span class="login-text">${state.user.name.split(' ').pop()}</span>`;
    prefillPhone();
    showToast(`Xin chào ${state.user.name}! 🍺`, 'success');
  }
}

/* ================================================================
   TOAST NOTIFICATION
   HTML: div#toastNotify
   CSS:  .toast, .toast.show, .toast.success, .toast.error
================================================================ */

let toastTimeout = null;

/**
 * showToast(message, type)
 * Hiện thông báo toast ở cuối màn hình
 * HTML: div#toastNotify
 * CSS:  .toast, .toast.show
 * @param {string} message
 * @param {string} type — 'success' | 'error' | 'info'
 */
function showToast(message, type = 'info') {
  const toast = document.getElementById('toastNotify');
  toast.textContent = message;
  toast.className   = `toast ${type} show`;

  // Tự ẩn sau 3s
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* ================================================================
   HELPERS
================================================================ */

/**
 * formatVND(amount)
 * Format số tiền thành chuỗi VNĐ có dấu phân cách
 * @param {number} amount
 * @returns {string} vd: "150.000đ"
 */
function formatVND(amount) {
  return amount.toLocaleString('vi-VN') + 'đ';
}

/* ================================================================
   GOOGLE MAPS — Night Style
   Áp dụng cho bản đồ preview trong phần 1
================================================================ */

/**
 * nightMapStyles()
 * Trả về mảng style bản đồ tối phù hợp theme
 * @returns {Array}
 */
function nightMapStyles() {
  return [
    { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
    { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
  ];
}

/* ================================================================
   AUTO STEP BAR — Tự cập nhật step khi người dùng tương tác
================================================================ */

/**
 * Lắng nghe sự kiện input trên các trường để tự cập nhật step bar
 * HTML: #pickupAddress, #dropoffAddress → step 1
 *       #vehiclePlate → step 2
 *       #phoneNumber  → step 3
 */
(function initStepListeners() {
  const onReady = () => {
    document.getElementById('pickupAddress')?.addEventListener('input', () => {
      if (document.getElementById('pickupAddress').value) updateStepBar(1);
    });
    document.getElementById('dropoffAddress')?.addEventListener('input', () => {
      if (document.getElementById('dropoffAddress').value) updateStepBar(1);
    });
    document.getElementById('vehiclePlate')?.addEventListener('input', () => {
      if (document.getElementById('vehiclePlate').value) updateStepBar(2);
    });
    document.getElementById('phoneNumber')?.addEventListener('input', () => {
      if (document.getElementById('phoneNumber').value) updateStepBar(3);
    });
    document.getElementById('scheduledTime')?.addEventListener('change', () => {
      state.scheduledTime = document.getElementById('scheduledTime').value;
      updateStepBar(4);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();

/* ================================================================
   INIT — Khởi tạo không cần Google Maps
   (Dự phòng nếu Maps chưa load xong)
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Nếu đã có user → cập nhật nút đăng nhập
  if (state.user) {
    document.getElementById('btnLogin').innerHTML =
      `<span class="login-icon">😄</span><span class="login-text">${state.user.name.split(' ').pop()}</span>`;
  }

  // Đặt min datetime cho picker = hiện tại
  const dtInput = document.getElementById('scheduledTime');
  if (dtInput) {
    dtInput.min = toLocalDatetimeInput(new Date());
  }

  // Render địa điểm yêu thích từ localStorage (không cần Maps)
  renderFavoritePlaces();

  // Render coupon demo
  renderCoupons();
});
