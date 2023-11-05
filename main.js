import {
    userIcon,
    setStorage,
    getStorage,
    translate,
    icons,
  } from './helpers.js';
  
  //!html den gelenler
  const form = document.querySelector('form');
  const input = document.querySelector('form #title');
  const cancelBtn = document.querySelector('form #cancel');
  const noteList = document.querySelector('ul');
  const expandBtn = document.querySelector('#checkbox');
  const aside = document.querySelector('.wrapper');
  
  //! ortak değişkenler
  var map;
  var coords = [];
  var notes = getStorage('NOTES') || [];
  var markerLayer = [];
  
  //!olay zileyicileri
  cancelBtn.addEventListener('click', () => {
    form.style.display = 'none';
    clearForm();
  });
  
  //* kullanıcnın konumuna göre haritaya ekrana basma
  function loadMap(coords) {
    // haritanın kurulumunu yapar
    map = L.map('map').setView(coords, 10);
  
    // haritanın nasıl gözükeceğini belirler
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  
    // imleçleri tutacağımız ayrı bir katman oluşturma
    markerLayer = L.layerGroup().addTo(map);
  
    // kullanıcının bulunduğu konumu gösterme
    L.marker(coords, { icon: userIcon })
      .addTo(map)
      .bindPopup('Bulunudğunuz Konum');
  
    // lokalden gelen notları ekran basar
    renderNoteList(notes);
  
    // haritadaki tıklanma olaylarını izler
    map.on('click', onMapClick);
  }
  
  //* formun gönderilmesini izleme
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // formun içindeki değerlere erişme
    const title = e.target[0].value;
    const date = e.target[1].value;
    const status = e.target[2].value;
    // notlar dizisine bu elemanı ekle
    notes.unshift({
      id: new Date().getTime(),
      title,
      date,
      status,
      coords,
    });
  
    // notları listele
    renderNoteList(notes);
  
    // gönderilen elemanları lokale kaydetme
    setStorage(notes);
  
    // formu kapat
    form.style.display = 'none';
    clearForm();
  });
  
  //* imleci ekrana basar
  function renderMarker(item) {
    // imleç oluştur
    L.marker(item.coords, { icon: icons[item.status] })
      // imleçi katmana ekle
      .addTo(markerLayer)
      // popup ekle
      .bindPopup(item.title);
  }
  
  //* note listesini ekrana basr
  function renderNoteList(items) {
    // eski elemanları temizleme
    noteList.innerHTML = '';
    // eski imleçleri temizle
    markerLayer.clearLayers();
  
    // her bir eleman için ekrana basma fonksiyon çalıştır
    items.forEach((ele) => {
      // li elemanı oluştur
      const listEle = document.createElement('li');
  
      // data-id ekleme
      listEle.dataset.id = ele.id;
  
      // içeriğini belirleme
      listEle.innerHTML = `
              <div>
                <p>${ele.title}</p>
                <p><span>Tarih:</span> ${ele.date}</p>
                <p><span>Durum:</span> ${translate[ele.status]}</p>
              </div>
              <i id="fly" class="bi bi-airplane-fill"></i>
              <i id="delete" class="bi bi-trash3-fill"></i>
      `;
      // html'deki listeye gönderme
      noteList.appendChild(listEle);
      // ekrana imleç bas
      renderMarker(ele);
    });
  }
  
  //* kullanıcının konumunu isteme
  navigator.geolocation.getCurrentPosition(
    // kullanıcı izin verirse haritayı
    // onun bulunduğu konumda açma
    (e) => loadMap([e.coords.latitude, e.coords.longitude]),
    // izin vermezse varsayılan konumda aç
    () => {
      loadMap([38.802424, 35.505317]);
    }
  );
  
  //* haritaya tıklanınca çalışan fonksiyon
  const onMapClick = (e) => {
    // koordinatları ortak alana aktar
    coords = [e.latlng.lat, e.latlng.lng];
    // formu göster
    form.style.display = 'flex';
    // inputa focuslama
    input.focus();
  };
  
  //* formu temizler
  function clearForm() {
    form[0].value = '';
    form[1].value = '';
    form[2].value = 'goto';
  }
  
  //! Silme ve Uçuş
  noteList.addEventListener('click', (e) => {
    const found_id = e.target.closest('li').dataset.id;
  
    if (
      e.target.id === 'delete' &&
      confirm('Silmek istiyor musunuz ?')
    ) {
      // id'sini bildiğimiz elemanı dizidem çıkarma
      notes = notes.filter((note) => note.id !== Number(found_id));
  
      // lokali güncelle
      setStorage(notes);
  
      // ekranı güncelle
      renderNoteList(notes);
    }
  
    if (e.target.id === 'fly') {
      // id'sini bildiğimiz elemanın koordinatlarına erişme
      const note = notes.find((note) => note.id === Number(found_id));
  
      // animasyonu çalıştır
      map.flyTo(note.coords, 15);
  
      // elemanın koordinatlarında geçici bir popup tanımlama
      var popup = L.popup()
        .setLatLng(note.coords)
        .setContent(note.title);
  
      // küçük ekranlarda uçurulduğunda menüyü kapat
      if (window.innerWidth < 769) {
        checkbox.checked = false;
        aside.classList.add('hide');
      }
      // popup'ı açma
      popup.openOn(map);
    }
  });
  
  //! Gizle / Göster
  checkbox.addEventListener('input', (e) => {
    const isChecked = e.target.checked;
  
    if (isChecked) {
      aside.classList.remove('hide');
    } else {
      aside.classList.add('hide');
    }
  });