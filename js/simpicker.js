/* SimpUI JS Module: Calendar: Multi-date select mode */
function simpickerCalendar(selector, options = {}) {
  const input = document.querySelector(selector);
  if (!input) return;

  const {
    enableTime = true,
    dateFormat = "d-m-Y h:i K",
    time_24hr = false,
    defaultDate = null,
    rtl = false,
    mode = "single" // <--- add mode option
  } = options;

  const wrapper = document.createElement('div');
  wrapper.className = 'simpicker-wrapper';
  if (rtl) wrapper.setAttribute("dir", "rtl");

  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);
  input.classList.add('simpicker-input');

  const popup = document.createElement('div');
  popup.className = 'simpicker-popup';
  wrapper.appendChild(popup);

  popup.innerHTML = `
    <div class="simpicker-header">
        <div class="prevMonth">
            <svg xmlns="http://www.w3.org/2000/svg" width="7" height="16" viewBox="0 0 7 16"><path fill="currentColor" d="M5.5 13a.47.47 0 0 1-.35-.15l-4.5-4.5c-.2-.2-.2-.51 0-.71l4.5-4.49c.2-.2.51-.2.71 0s.2.51 0 .71L1.71 8l4.15 4.15c.2.2.2.51 0 .71c-.1.1-.23.15-.35.15Z" stroke-width="1" stroke="currentColor"/></svg>
        </div>
      <div class="calendar-month"></div>
      <div class="calendar-year"></div>
      <div class="nextMonth">
        <svg xmlns="http://www.w3.org/2000/svg" width="7" height="16" viewBox="0 0 7 16"><path fill="currentColor" d="M1.5 13a.47.47 0 0 1-.35-.15c-.2-.2-.2-.51 0-.71L5.3 7.99L1.15 3.85c-.2-.2-.2-.51 0-.71s.51-.2.71 0l4.49 4.51c.2.2.2.51 0 .71l-4.5 4.49c-.1.1-.23.15-.35.15" stroke-width="1" stroke="currentColor"/></svg>
      </div>
    </div>
    <div class="simpicker-calendar"></div>
        <div class="simpicker-separator"></div>
    ${enableTime ? `<div class="simpicker-time">
      <div class="calendar-hour"></div>
      <div class="calendar-minute"></div>
      ${!time_24hr ? `<div class="calendar-ampm"></div>` : ''}
    </div>` : ''}
    <div class="simpicker-separator"></div>
    <div class="simpicker-set">
      <div class="simpui-btn dark sm" id="darkBtn">Set</div>
    </div>
  `;

  const calendarGrid = popup.querySelector('.simpicker-calendar');
  const setBtn = popup.querySelector('.simpicker-set');
  const prevMonthBtn = popup.querySelector('.prevMonth');
  const nextMonthBtn = popup.querySelector('.nextMonth');

  const monthContainer = popup.querySelector('.calendar-month');
  const yearContainer = popup.querySelector('.calendar-year');
  const hourContainer = popup.querySelector('.calendar-hour');
  const minuteContainer = popup.querySelector('.calendar-minute');
  const ampmContainer = popup.querySelector('.calendar-ampm');

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  // Multi-date support
  let selectedDates = [];
  let selectedDate = defaultDate ? parseCustomDate(defaultDate) : new Date();
  if (isNaN(selectedDate)) selectedDate = new Date();

  // If mode multiple, parse defaultDate as comma separated!
  if (mode === "multiple" && defaultDate) {
    selectedDates = defaultDate.split(",").map(dt => parseCustomDate(dt.trim()))
        .filter(d => !isNaN(d));
    if (selectedDates.length === 0) selectedDates = [new Date()];
    selectedDate = selectedDates[selectedDates.length - 1];
    input.setAttribute("data-default", "true");
  } else if (mode === "multiple") {
    selectedDates = [];
  }

  let dropdownRefs = {};

  function createCalendarDropdown(container, type, optionsList, defaultIndex, onSelect) {
    const selectWrapper = document.createElement('div');
    selectWrapper.className = 'simpui-calendar-select';
    selectWrapper.dataset.type = type;

    const trigger = document.createElement('div');
    trigger.className = 'simpui-calendar-select-trigger';
    const triggerText = document.createElement('span');
    triggerText.className = 'simpui-selected-text';
    triggerText.textContent = optionsList[defaultIndex];

    const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chevron.setAttribute('class', 'simpui-chevron');
    chevron.setAttribute('width', '16');
    chevron.setAttribute('height', '16');
    chevron.setAttribute('viewBox', '0 0 20 20');
    chevron.setAttribute('fill', 'none');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M6 8l4 4 4-4');
    path.setAttribute('stroke', '#555');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    chevron.appendChild(path);

    trigger.appendChild(triggerText);
    trigger.appendChild(chevron);
    selectWrapper.appendChild(trigger);

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'simpui-options';

    optionsList.forEach((label, index) => {
      const option = document.createElement('div');
      option.className = 'simpui-option';
      option.textContent = label;
      option.dataset.value = index;
      if (index === defaultIndex) option.classList.add('active');
      option.addEventListener('click', () => {
        triggerText.textContent = label;
        optionsContainer.querySelectorAll('.simpui-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        selectWrapper.classList.remove('open');
        optionsContainer.classList.remove('show');
        onSelect(index, label);
      });
      optionsContainer.appendChild(option);
    });

    selectWrapper.appendChild(optionsContainer);

    trigger.addEventListener('click', () => {
      document.querySelectorAll('.simpui-options').forEach(o => o.classList.remove('show'));
      optionsContainer.classList.toggle('show');
    });

    container.appendChild(selectWrapper);

    dropdownRefs[type] = {
      triggerText,
      optionsContainer
    };
  }

  function formatDate(dateObj) {
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = dateObj.getFullYear();

    let h = dateObj.getHours();
    let hr = enableTime ? String(h).padStart(2, '0') : '';
    let min = enableTime ? String(dateObj.getMinutes()).padStart(2, '0') : '';
    let ampm = '';

    if (!time_24hr && enableTime) {
      ampm = h >= 12 ? ' PM' : ' AM';
      hr = String(h % 12 || 12).padStart(2, '0');
    }

    return enableTime ? `${dd}-${mm}-${yyyy} ${hr}:${min}${ampm}` : `${dd}-${mm}-${yyyy}`;
  }

  function updateInputValue() {
    if (mode === "multiple") {
      input.value = selectedDates.map(formatDate).join(", ");
    } else {
      const dd = String(selectedDate.getDate()).padStart(2, '0');
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const yyyy = selectedDate.getFullYear();

      let h = selectedDate.getHours();
      let hr = enableTime ? String(h).padStart(2, '0') : '';
      let min = enableTime ? String(selectedDate.getMinutes()).padStart(2, '0') : '';
      let ampm = '';

      if (!time_24hr && enableTime) {
        ampm = h >= 12 ? ' PM' : ' AM';
        hr = String(h % 12 || 12).padStart(2, '0');
      }

      input.value = enableTime ? `${dd}-${mm}-${yyyy} ${hr}:${min}${ampm}` : `${dd}-${mm}-${yyyy}`;
    }
  }

  updateInputValue();

  createCalendarDropdown(monthContainer, 'month', months, selectedDate.getMonth(), (i) => {
    selectedDate.setMonth(i);
    renderCalendar(selectedDate);
  });

  const yearList = Array.from({ length: 131 }, (_, i) => 1970 + i).map(String);
  createCalendarDropdown(yearContainer, 'year', yearList, selectedDate.getFullYear() - 1970, (i) => {
    selectedDate.setFullYear(1970 + i);
    renderCalendar(selectedDate);
  });

  if (enableTime) {
    const hourRange = time_24hr ? 24 : 12;
    const hourList = Array.from({ length: hourRange }, (_, i) =>
        time_24hr ? String(i).padStart(2, '0') : String(i === 0 ? 12 : i).padStart(2, '0')
    );
    const hourVal = time_24hr ? selectedDate.getHours() : selectedDate.getHours() % 12 || 12;
    createCalendarDropdown(hourContainer, 'hour', hourList, hourVal % hourRange, () => {});

    const minuteList = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
    createCalendarDropdown(minuteContainer, 'minute', minuteList, selectedDate.getMinutes(), () => {});

    if (!time_24hr) {
      const isPM = selectedDate.getHours() >= 12;
      createCalendarDropdown(ampmContainer, 'ampm', ['AM', 'PM'], isPM ? 1 : 0, () => {});
    }
  }

  function ymdEqual(a, b) {
    return (
      a &&
      b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const today = new Date();

    calendarGrid.innerHTML = '';
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(d => {
      const div = document.createElement('div');
      div.className = 'weekday';
      div.textContent = d;
      calendarGrid.appendChild(div);
    });

    const prevMonthDays = new Date(year, month, 0).getDate();

    // Calculate how many cells are needed to show current month
    const totalNeeded = firstDay + daysInMonth;
    const totalCells = totalNeeded > 35 ? 42 : 35;

    // Previous month's tail days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const div = document.createElement('div');
      div.className = 'day dimmed';
      div.textContent = day;
      div.addEventListener('click', () => {
        selectedDate = new Date(year, month - 1, day, selectedDate.getHours(), selectedDate.getMinutes());
        renderCalendar(selectedDate);
      });
      calendarGrid.appendChild(div);
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const div = document.createElement('div');
      div.className = 'day';
      div.textContent = day;

      // Multi-select highlight logic
      let isMultiSelected = false;
      if (mode === "multiple") {
        isMultiSelected = selectedDates.some(selDate =>
          selDate.getFullYear() === year &&
          selDate.getMonth() === month &&
          selDate.getDate() === day
        );
      }
      const isSelected = (
        year === selectedDate.getFullYear() &&
        month === selectedDate.getMonth() &&
        day === selectedDate.getDate()
      );
      const isToday = (
        year === today.getFullYear() &&
        month === today.getMonth() &&
        day === today.getDate()
      );

      if (mode === "multiple" && isMultiSelected) {
        div.classList.add('selected');
      } else if (isSelected && mode !== "multiple") {
        div.classList.add('selected');
      }
      if (isToday) div.classList.add('today');

      div.addEventListener('click', function () {
        if (mode === "multiple") {
          // Build the clicked date object from this cell and dropdowns
          let h = enableTime ? parseInt(dropdownRefs.hour.triggerText.textContent, 10) : 0;
          let m = enableTime ? parseInt(dropdownRefs.minute.triggerText.textContent, 10) : 0;
          if (enableTime && !time_24hr) {
            const ampm = dropdownRefs.ampm.triggerText.textContent;
            if (ampm === 'PM' && h !== 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;
          }
          let clickedDate = new Date(year, month, day, h, m, 0, 0);

          let alreadyIdx = selectedDates.findIndex(d => ymdEqual(d, clickedDate));

          // If exactly one date, and it's a default date, and not the clicked one, replace
          if (
            selectedDates.length === 1 &&
            !ymdEqual(selectedDates[0], clickedDate) &&
            input.hasAttribute("data-default")
          ) {
            selectedDates = [clickedDate];
            input.removeAttribute("data-default");
          } else if (alreadyIdx > -1) {
            selectedDates.splice(alreadyIdx, 1); // remove (toggle off)
          } else {
            selectedDates.push(clickedDate); // add (toggle on)
          }

          updateInputValue();
          selectedDate = clickedDate;
          renderCalendar(selectedDate);
        } else {
          selectedDate.setDate(day);
          renderCalendar(selectedDate);
        }
      });

      calendarGrid.appendChild(div);
    }

    // Fill remaining cells from next month
    const filled = calendarGrid.querySelectorAll('.day').length;
    const remaining = totalCells - filled;

    for (let i = 1; i <= remaining; i++) {
      const div = document.createElement('div');
      div.className = 'day dimmed';
      div.textContent = i;
      div.addEventListener('click', () => {
        selectedDate = new Date(year, month + 1, i, selectedDate.getHours(), selectedDate.getMinutes());
        renderCalendar(selectedDate);
      });
      calendarGrid.appendChild(div);
    }

    dropdownRefs.month.triggerText.textContent = months[selectedDate.getMonth()];
    dropdownRefs.year.triggerText.textContent = selectedDate.getFullYear();
  }

  function parseCustomDate(str) {
    const parts = str.match(/(\d{2})-(\d{2})-(\d{4}) (\d{1,2}):(\d{2})\s*(AM|PM)?/);
    if (!parts) {
      // Try parse without time
      const dateOnly = str.match(/(\d{2})-(\d{2})-(\d{4})/);
      if (!dateOnly) return new Date();
      let [_, d, m, y] = dateOnly;
      return new Date(+y, +m - 1, +d, 0, 0);
    }
    let [_, d, m, y, hh, mm, ap] = parts;
    let h = parseInt(hh, 10);
    if (!time_24hr) {
      if (ap === 'PM' && h < 12) h += 12;
      if (ap === 'AM' && h === 12) h = 0;
    }
    return new Date(+y, +m - 1, +d, h, +mm);
  }

  input.addEventListener('click', () => {
    popup.style.display = 'block';
    renderCalendar(selectedDate);
  });

  setBtn.addEventListener('click', () => {
    if (enableTime) {
      let h = parseInt(dropdownRefs.hour.triggerText.textContent, 10);
      const m = parseInt(dropdownRefs.minute.triggerText.textContent, 10);
      if (!time_24hr) {
        const ampm = dropdownRefs.ampm.triggerText.textContent;
        if (ampm === 'PM' && h !== 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
      }
      if (mode === "multiple") {
        for (let i = 0; i < selectedDates.length; i++) {
          if (
            selectedDates[i].getFullYear() === selectedDate.getFullYear() &&
            selectedDates[i].getMonth() === selectedDate.getMonth() &&
            selectedDates[i].getDate() === selectedDate.getDate()
          ) {
            selectedDates[i].setHours(h, m, 0);
          }
        }
      } else {
        selectedDate.setHours(h, m, 0);
      }
    }
    updateInputValue();
    popup.style.display = 'none';
  });

  prevMonthBtn.addEventListener('click', () => {
    selectedDate.setMonth(selectedDate.getMonth() - 1);
    renderCalendar(selectedDate);
  });

  nextMonthBtn.addEventListener('click', () => {
    selectedDate.setMonth(selectedDate.getMonth() + 1);
    renderCalendar(selectedDate);
  });

  document.addEventListener('mousedown', (e) => {
    const isInsidePicker = wrapper.contains(e.target);
    const isDropdown = e.target.closest('.simpui-calendar-select');
    if (!isDropdown) {
      document.querySelectorAll('.simpui-options').forEach(o => o.classList.remove('show'));
    }
    if (!isInsidePicker) {
      popup.style.display = 'none';
    }
  });
}


// Dropdowns
document.addEventListener("DOMContentLoaded", function () {
  const calendarSelects = document.querySelectorAll(".simpui-calendar-select");

  calendarSelects.forEach(select => {
    const trigger = select.querySelector(".simpui-calendar-select-trigger");
    const options = select.querySelector(".simpui-options");
    const hiddenInput = select.parentElement.querySelector("input[type='hidden']");

    // Open dropdown on click anywhere on .simpui-calendar-select
    select.addEventListener("click", function (e) {
      // Prevent double toggling if click is inside trigger
      if (!select.classList.contains("open")) {
        select.classList.add("open");
        // Optionally close other open dropdowns
        document.querySelectorAll(".simpui-calendar-select.open").forEach(s => {
          if (s !== select) s.classList.remove("open");
        });
      }
    });

    // Option selection
    options.querySelectorAll(".simpui-option").forEach(option => {
      option.addEventListener("click", function (e) {
        trigger.querySelector('.simpui-selected-text').textContent = this.textContent;
        if (hiddenInput) hiddenInput.value = this.getAttribute("data-value");
        select.classList.remove("open");
        e.stopPropagation();
      });
    });

    // Close dropdown when clicking outside .simpui-calendar-select
    document.addEventListener("click", function (e) {
      if (!select.contains(e.target)) {
        select.classList.remove("open");
      }
    });
  });
});