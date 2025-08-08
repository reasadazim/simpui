/*!
 * Simpicker Calendar: A simple calendar with date and time picker
 * SimpUI CSS Module: Calendar
 * Author: A. M. Reasad Azim Bappy
 * License: GPL-3.0
 * Version: 1.0
 */

function simpickerCalendar(selector, options = {}) {
  const input = document.querySelector(selector);
  if (!input) return;

  const {
    enableTime = true,
    dateFormat = "d-m-Y h:i K",
    time_24hr = false,
    defaultDate = null,
    rtl = false,
    mode = "single", // mode: "single", "multiple", or "range"
    disable = [],
    weekend = [] // e.g. ['Sat','Sun']
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
        <div class="simpicker-separator top-separator"></div>
    ${enableTime ? `<div class="simpicker-time">
      <div class="calendar-hour"></div>
      <div class="calendar-minute"></div>
      ${!time_24hr ? `<div class="calendar-ampm"></div>` : ''}
    </div>` : ''}
    <div class="simpicker-separator bottom-separator"></div>
    <div class="simpicker-set">
      <div class="simpui-btn dark sm" id="resetBtn">Reset</div>
      <div class="simpui-btn dark sm" id="setBtn">Set</div>
    </div>
  `;

  const calendarGrid = popup.querySelector('.simpicker-calendar');
  const setBtn = popup.querySelector('.simpicker-set').querySelector('#setBtn');
  const resetBtn = popup.querySelector('.simpicker-set').querySelector('#resetBtn');
  const prevMonthBtn = popup.querySelector('.prevMonth');
  const nextMonthBtn = popup.querySelector('.nextMonth');
  const monthContainer = popup.querySelector('.calendar-month');
  const yearContainer = popup.querySelector('.calendar-year');
  const hourContainer = popup.querySelector('.calendar-hour');
  const minuteContainer = popup.querySelector('.calendar-minute');
  const ampmContainer = popup.querySelector('.calendar-ampm');

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  let selectedDates = [];

  let selectedDate = defaultDate ? parseCustomDate(defaultDate) : new Date();
  let selectedDateInit = defaultDate ? parseCustomDate(defaultDate) : new Date(); // Since selectedDate got changes in different functions, to avoid same selected dates across the calendar this value is set
  let defaultDateInit = defaultDate ? parseCustomDate(defaultDate) : null;
  if (isNaN(selectedDate)) selectedDate = new Date();

  // hide the top separator if time is not enabled
  if (!enableTime) {
    const bottomSep = popup.querySelector('.bottom-separator');
    const topSep = popup.querySelector('.simpicker-separator');
    const setBtns = popup.querySelector('.simpicker-set');

    if (bottomSep) bottomSep.style.display = 'none';
    if (topSep) topSep.style.display = 'none';
    if (setBtns) setBtns.style.display = 'none';
  }


  let rangeDates = [];
  if (mode === "range" && defaultDate) {
    const parts = defaultDate.split(",");
    rangeDates = parts.map(dt => parseCustomDate(dt.trim())).filter(d => !isNaN(d));
    if (rangeDates.length === 1) {
      selectedDate = rangeDates[0];
    } else if (rangeDates.length === 2) {
      selectedDate = rangeDates[1];
    }
  }
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

  // This function updates the input field.
  // If you want to disable input value change on click calendar date, you can comment this function inside renderCalendar() function or anywhere it exists.
  // Optional paramenter reset is used to detect if this function invoked from reset button click or not.
  // If it is called from reset button click, we clear the input field too (if time disabled.) If time enabled, reset button click clears the input field.

  function updateInputValue(reset = null) {
    if (mode === "multiple") {
      input.value = selectedDates.map(formatDate).join(", ");
    } else if (mode === "range") {
      if (rangeDates.length === 2) {
        input.value = `${formatDate(rangeDates[0])}, ${formatDate(rangeDates[1])}`;
      } else if (rangeDates.length === 1) {
        input.value = `${formatDate(rangeDates[0])}`;
      }
    } else {
      if(reset == 1){
        input.value = '';
      }else{
        input.value = formatDate(selectedDate);
      }
    }
  }

  if(defaultDateInit!=null) {
    updateInputValue();
  }

  // --- Disable Dates: Normalize for lookup ---
  // Accepts "YYYY-MM-DD", "DD-MM-YYYY", or Date objects
  function normalizeDisableArray(arr) {
    return arr.map(val => {
      if (val instanceof Date) {
        return `${val.getFullYear()}-${String(val.getMonth()+1).padStart(2,'0')}-${String(val.getDate()).padStart(2,'0')}`;
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val; // "YYYY-MM-DD"
      if (/^\d{2}-\d{2}-\d{4}$/.test(val)) { // "DD-MM-YYYY"
        const [d,m,y] = val.split("-");
        return `${y}-${m}-${d}`;
      }
      return ""; // skip unrecognized
    });
  }
  const disabledDates = normalizeDisableArray(disable);

  function isDisabledDate(d) {
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return disabledDates.includes(key);
  }

  // Helper: Get day abbreviation for a JS Date (Sun, Mon, etc)
  function getDayAbbr(date) {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  }

  createCalendarDropdown(monthContainer, 'month', months, selectedDate.getMonth(), (i) => {
    viewDate.setMonth(i);
    renderCalendar(viewDate);
  });

  const yearList = Array.from({ length: 131 }, (_, i) => 1970 + i).map(String);
  createCalendarDropdown(yearContainer, 'year', yearList, selectedDate.getFullYear() - 1970, (i) => {
    viewDate.setFullYear(1970 + i);
    renderCalendar(viewDate);
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
        a && b &&
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
  }
  function isDateInRange(d, start, end) {
    if (!start || !end) return false;
    const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const st = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const et = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
    return st < et ? (dt > st && dt < et) : (dt > et && dt < st);
  }

  // --- Calendar view state ---
  let viewDate = new Date(selectedDate);


  function renderCalendar(date) {
    // Always use viewDate for rendering
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const today = new Date();

    calendarGrid.innerHTML = '';
    // Weekday titles with weekend highlighting
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((d, idx) => {
      const div = document.createElement('div');
      div.className = 'weekday';
      div.textContent = d;
      if (weekend && weekend.includes(d)) {
        div.classList.add('weekend');
      }
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
      const prevDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      if (weekend && weekend.includes(getDayAbbr(prevDate))) {
        div.classList.add('weekend');
      }
      div.addEventListener('click', () => {
        viewDate.setMonth(viewDate.getMonth() - 1);
        renderCalendar(viewDate);
      });
      calendarGrid.appendChild(div);
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const div = document.createElement('div');
      div.className = 'day';
      div.textContent = day;
      const thisDate = new Date(year, month, day, 0, 0, 0, 0);

      // --- Highlight weekends ---
      if (weekend && weekend.includes(getDayAbbr(thisDate))) {
        div.classList.add('weekend');
      }

      // --- DISABLED LOGIC ---
      let isDisabled = isDisabledDate(thisDate);
      if (isDisabled) div.classList.add('disabled');
      // Add a cross (x) svg over the cell
      if (isDisabled) {
        div.innerHTML = `
          <span class="simpicker-disabled-date">${day}</span>
          <span class="simpicker-disabled-icon">
            <svg width="24" height="24" viewBox="0 0 12 12">
              <line x1="2" y1="2" x2="10" y2="10" stroke="#ff0000" stroke-width="1"/>
              <line x1="10" y1="2" x2="2" y2="10" stroke="#ff0000" stroke-width="1"/>
            </svg>
          </span>
        `;
      }

      let isMultiSelected = false;
      if (mode === "multiple") {
        isMultiSelected = selectedDates.some(selDate =>
            ymdEqual(thisDate, selDate)
        );
      }
      const isSelected = ymdEqual(thisDate, selectedDate);
      const isToday = ymdEqual(thisDate, today);

      // --- Range Mode Highlight Logic ---
      let isRangeStart = false, isRangeEnd = false, isInRange = false;
      if (mode === "range" && rangeDates.length >= 1) {
        if (rangeDates[0] && ymdEqual(thisDate, rangeDates[0])) isRangeStart = true;
        if (rangeDates[1] && ymdEqual(thisDate, rangeDates[1])) isRangeEnd = true;
        if (rangeDates.length === 2 && isDateInRange(thisDate, rangeDates[0], rangeDates[1])) isInRange = true;
      }

      if (mode === "range") {
        if (isRangeStart) div.classList.add('selected', 'range-start');
        if (isRangeEnd) div.classList.add('selected', 'range-end');
        if (isInRange) div.classList.add('in-range');
      } else if (mode === "multiple" && isMultiSelected) {
        div.classList.add('selected');
      } else if (isSelected && mode !== "multiple" && mode !== "range") {
        div.classList.add('selected');
      }


// highlight today's date
      if (isToday) {
        div.classList.add('today');
      }

// Remove highlight the same selected days if the month
      if (
          selectedDateInit &&
          (selectedDateInit.getMonth() !== viewDate.getMonth() ||
              selectedDateInit.getFullYear() !== viewDate.getFullYear())
      ) {
        div.classList.remove('selected');
      }

      // --- Clicking disabled dates is not allowed ---
      if (!isDisabled) {
        div.addEventListener('click', function () {
          if (mode === "multiple") {
            let h = enableTime ? parseInt(dropdownRefs.hour.triggerText.textContent, 10) : 0;
            let m = enableTime ? parseInt(dropdownRefs.minute.triggerText.textContent, 10) : 0;
            if (enableTime && !time_24hr) {
              const ampm = dropdownRefs.ampm.triggerText.textContent;
              if (ampm === 'PM' && h !== 12) h += 12;
              if (ampm === 'AM' && h === 12) h = 0;
            }
            let clickedDate = new Date(year, month, day, h, m, 0, 0);

            let alreadyIdx = selectedDates.findIndex(d => ymdEqual(d, clickedDate));
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
            renderCalendar(viewDate);
          } else if (mode === "range") {
            let h = enableTime ? parseInt(dropdownRefs.hour.triggerText.textContent, 10) : 0;
            let m = enableTime ? parseInt(dropdownRefs.minute.triggerText.textContent, 10) : 0;
            if (enableTime && !time_24hr) {
              const ampm = dropdownRefs.ampm.triggerText.textContent;
              if (ampm === 'PM' && h !== 12) h += 12;
              if (ampm === 'AM' && h === 12) h = 0;
            }
            let clickedDate = new Date(year, month, day, h, m, 0, 0);

            if (rangeDates.length === 0 || rangeDates.length === 2) {
              rangeDates = [clickedDate];
            } else if (rangeDates.length === 1) {
              if (clickedDate < rangeDates[0]) {
                rangeDates = [clickedDate, rangeDates[0]];
              } else {
                rangeDates = [rangeDates[0], clickedDate];
              }
            }
            updateInputValue();
            selectedDate = clickedDate;
            viewDate = new Date(clickedDate);
            renderCalendar(viewDate);
          } else {
            let h = enableTime ? parseInt(dropdownRefs.hour?.triggerText.textContent, 10) : 0;
            let m = enableTime ? parseInt(dropdownRefs.minute?.triggerText.textContent, 10) : 0;
            if (enableTime && !time_24hr) {
              const ampm = dropdownRefs.ampm?.triggerText.textContent;
              if (ampm === "PM" && h !== 12) h += 12;
              if (ampm === "AM" && h === 12) h = 0;
            }

// ✅ Completely replace selectedDate with new object:
            selectedDate = new Date(year, month, day, h, m, 0, 0);

// ✅ Keep viewDate as-is (don’t overwrite it anymore)
            updateInputValue();
            renderCalendar(viewDate);

          }
        });
      }

      calendarGrid.appendChild(div);
    }

    // Fill remaining cells from next month
    const filled = calendarGrid.querySelectorAll('.day').length;
    const remaining = totalCells - filled;

    for (let i = 1; i <= remaining; i++) {
      const div = document.createElement('div');
      div.className = 'day dimmed';
      div.textContent = i;
      const nextDate = new Date(year, month + 1, i, 0, 0, 0, 0);
      if (weekend && weekend.includes(getDayAbbr(nextDate))) {
        div.classList.add('weekend');
      }
      div.addEventListener('click', () => {
        viewDate.setMonth(viewDate.getMonth() + 1);
        renderCalendar(viewDate);
      });
      calendarGrid.appendChild(div);
    }

    dropdownRefs.month.triggerText.textContent = months[viewDate.getMonth()];
    dropdownRefs.year.triggerText.textContent = viewDate.getFullYear();
  }

  function parseCustomDate(str) {
    if (str instanceof Date) return str;
    const parts = typeof str === "string" && str.match(/(\d{2})-(\d{2})-(\d{4}) (\d{1,2}):(\d{2})\s*(AM|PM)?/);
    if (!parts) {
      const dateOnly = typeof str === "string" && str.match(/(\d{2})-(\d{2})-(\d{4})/);
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

    // Animation - open

    popup.classList.remove('show'); // Ensure clean state
    popup.classList.add('dropdown-anim');
    popup.style.display = 'block';

    // Force a reflow to restart the animation
    void popup.offsetHeight;

    popup.classList.add('show');

    // END - Animation - open

    viewDate = (mode === "range" && rangeDates.length)
        ? rangeDates[rangeDates.length-1]
        : (mode === "multiple" && selectedDates.length)
            ? selectedDates[selectedDates.length-1]
            : selectedDate;
    renderCalendar(viewDate);
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
          if (ymdEqual(selectedDates[i], selectedDate)) {
            selectedDates[i].setHours(h, m, 0);
          }
        }
      } else if (mode === "range") {
        if (rangeDates.length === 1) {
          rangeDates[0].setHours(h, m, 0);
        } else if (rangeDates.length === 2) {
          rangeDates[1].setHours(h, m, 0);
        }
      } else {
        selectedDate.setHours(h, m, 0);
      }
    }
    updateInputValue();

    // Animation - close

    popup.classList.remove('show');

    popup.addEventListener('transitionend', function handler() {
      popup.style.display = 'none';
      popup.removeEventListener('transitionend', handler);
    });  popup.classList.remove('show');

    popup.addEventListener('transitionend', function handler() {
      popup.style.display = 'none';
      popup.removeEventListener('transitionend', handler);
    });

    // END - Animation - close

  });

  // --- RESET BUTTON FUNCTIONALITY ---
  resetBtn.addEventListener('click', () => {
    // Reset everything to initial state
    if (mode === "multiple") {
      selectedDates = [];
      input.removeAttribute("data-default");
    } else if (mode === "range") {
      rangeDates = [];
    }
    // Reset selectedDate to today or defaultDate if it exists
    selectedDate = defaultDate ? parseCustomDate(defaultDate) : new Date();
    if (isNaN(selectedDate)) selectedDate = new Date();

    // Reset time dropdowns if enabled
    if (enableTime) {
      let h = time_24hr ? selectedDate.getHours() : selectedDate.getHours() % 12 || 12;
      let m = selectedDate.getMinutes();
      if (dropdownRefs.hour) dropdownRefs.hour.triggerText.textContent = time_24hr ? String(h).padStart(2, '0') : String(h === 0 ? 12 : h).padStart(2, '0');
      if (dropdownRefs.minute) dropdownRefs.minute.triggerText.textContent = String(m).padStart(2, '0');
      if (dropdownRefs.ampm && !time_24hr) {
        dropdownRefs.ampm.triggerText.textContent = selectedDate.getHours() >= 12 ? 'PM' : 'AM';
      }
    }

    updateInputValue(1);
    viewDate = new Date(selectedDate);
    renderCalendar(viewDate);
  });

  prevMonthBtn.addEventListener('click', () => {
    viewDate.setMonth(viewDate.getMonth() - 1);
    renderCalendar(viewDate);
  });

  nextMonthBtn.addEventListener('click', () => {
    viewDate.setMonth(viewDate.getMonth() + 1);
    renderCalendar(viewDate);
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

    select.addEventListener("click", function (e) {
      if (!select.classList.contains("open")) {
        select.classList.add("open");
        document.querySelectorAll(".simpui-calendar-select.open").forEach(s => {
          if (s !== select) s.classList.remove("open");
        });
      }
    });

    options.querySelectorAll(".simpui-option").forEach(option => {
      option.addEventListener("click", function (e) {
        trigger.querySelector('.simpui-selected-text').textContent = this.textContent;
        if (hiddenInput) hiddenInput.value = this.getAttribute("data-value");
        select.classList.remove("open");
        e.stopPropagation();
      });
    });

    document.addEventListener("click", function (e) {
      if (!select.contains(e.target)) {
        select.classList.remove("open");
      }
    });
  });
});