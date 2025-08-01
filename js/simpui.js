/* SimpUI JS Module: Input Fields, buttons*/

document.addEventListener("DOMContentLoaded", () => {

    // Input fields

    const fileInputs = document.querySelectorAll(".simpui-file");

    fileInputs.forEach(fileInput => {
        const label = fileInput.nextElementSibling;
        const labelTextSpan = label.querySelector("#photo-label-text");

        fileInput.addEventListener("change", function () {
            let labelText = "No file chosen";
            if (this.files.length === 1) {
                labelText = this.files[0].name;
            } else if (this.files.length > 1) {
                labelText = `${this.files.length} files selected`;
            }
            if (labelTextSpan) {
                labelTextSpan.textContent = labelText;
            }
        });

        label.addEventListener("mousedown", (e) => {
            if (!fileInput.disabled) {
                fileInput.click();
                fileInput.disabled = true;
                setTimeout(() => fileInput.disabled = false, 500);
            }
            e.preventDefault();
        });
    });


    // Upload input field

    const fileInput = document.getElementById('documents');
    const label = document.querySelector('.simpui-file-label[for="documents"]');
    const labelTextSpan = label.querySelector('#documents-label-text');

    fileInput.addEventListener("change", function () {
        let labelText = "No files chosen";
        if (this.files.length === 1) {
            labelText = this.files[0].name;
        } else if (this.files.length > 1) {
            labelText = `${this.files.length} files added`;
        }
        labelTextSpan.textContent = labelText;
    });

    const formGroups = document.querySelectorAll(".simpui-form-group input, .simpui-form-group textarea");

    formGroups.forEach(field => {
        field.addEventListener("invalid", () => {
            field.parentElement.classList.add("has-error");
        });
        field.addEventListener("input", () => {
            field.parentElement.classList.remove("has-error");
        });
    });


    // Auto-height textareas

    const autoTextareas = document.querySelectorAll(".simpui-textarea");

    autoTextareas.forEach(textarea => {
        const resize = () => {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        };

        textarea.addEventListener("input", resize);
        resize(); // run on load in case there's content
    });




    // Dropdown

    const simpuiSelects = document.querySelectorAll(".simpui-select");

    simpuiSelects.forEach(select => {
        const trigger = select.querySelector(".simpui-select-trigger");
        const options = select.querySelector(".simpui-options");
        const hiddenInput = select.parentElement.querySelector("input[type='hidden']");

        // Changed: Add event listener to the .simpui-select itself
        select.addEventListener("click", function (e) {
            const isOption = e.target.closest('.simpui-options span');
            const isInput = e.target.classList.contains('simpui-options-input');

            // Only toggle if not clicking on an option or the input
            if (!isOption && !isInput) {
                select.classList.toggle("open");
            }
        });

        options.querySelectorAll("span").forEach(option => {
            option.addEventListener("click", function (e) {
                trigger.querySelector('.simpui-selected-text').textContent = this.textContent;
                hiddenInput.value = this.getAttribute("data-value");
                select.classList.remove("open");
                e.stopPropagation(); // Prevent bubbling to .simpui-select
            });
        });

        document.addEventListener("click", function (e) {
            if (!select.contains(e.target)) {
                select.classList.remove("open");
            }
        });



        // Dropdown - With search filter

        const searchInput = options.querySelector(".simpui-options-input");

        if (searchInput) {
            searchInput.addEventListener("input", function () {
                const searchValue = this.value.trim().toLowerCase();
                const spans = options.querySelectorAll("span");


                function isFuzzyMatch(text, search) {
                    if (!search) return true;
                    if (text.includes(search)) return true;

                    // Loose character sequence match (e.g. "ns" matches "nsw")
                    let tIndex = 0;
                    for (let sIndex = 0; sIndex < search.length; sIndex++) {
                        const sChar = search[sIndex];
                        tIndex = text.indexOf(sChar, tIndex);
                        if (tIndex === -1) return false;
                        tIndex++;
                    }
                    return true;
                }


                spans.forEach(span => {
                    const text = span.textContent.trim();
                    const lowerText = text.toLowerCase();

                    // Remove any previous highlights
                    span.innerHTML = text;

                    if (isFuzzyMatch(lowerText, searchValue)) {
                        span.style.display = "block";

                        // Highlight matching part (basic version)
                        const regex = new RegExp(`(${searchValue})`, 'i');
                        span.innerHTML = text.replace(regex, `<mark>$1</mark>`);
                    } else {
                        span.style.display = "none";
                    }
                });
            });

        }

    });



    // Multiselect Dropdown
    document.querySelectorAll(".simpui-select.multiselect").forEach(select => {
        const trigger = select.querySelector(".simpui-select-trigger");
        const options = select.querySelector(".simpui-options");
        const hiddenInput = select.parentElement.querySelector("input[type='hidden']");

        // Toggle open/close
        trigger.addEventListener("click", function (e) {
            select.classList.toggle("open");
            e.stopPropagation();
        });

        // Checkbox change updates display and hidden input
        options.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
            checkbox.addEventListener("change", () => {
                const selected = Array.from(options.querySelectorAll("input:checked")).map(cb => cb.value);
                hiddenInput.value = selected.join(",");
                trigger.querySelector(".simpui-selected-text").textContent = selected.length > 0
                    ? selected.join(", ")
                    : "Select States";
            });
        });

        // Close when clicking outside
        document.addEventListener("click", function (e) {
            if (!select.contains(e.target)) {
                select.classList.remove("open");
            }
        });
    });




    // OTP

    const inputs = document.querySelectorAll('.simpui-otp-input');

    inputs.forEach((input, idx) => {
        // Handle normal typing
        input.addEventListener('input', () => {
            if (input.value.length === 1 && idx < inputs.length - 1) {
                inputs[idx + 1].focus();
            }
        });

        // Handle backspace
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && idx > 0) {
                inputs[idx - 1].focus();
            }
        });

        // Handle paste event
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            // Only digits, and limit to inputs length
            const pasteValues = paste.replace(/\D/g, '').slice(0, inputs.length).split('');
            pasteValues.forEach((char, i) => {
                inputs[i].value = char;
            });
            // Focus last filled input
            if (pasteValues.length > 0 && pasteValues.length < inputs.length) {
                inputs[pasteValues.length].focus();
            } else if (pasteValues.length === inputs.length) {
                inputs[inputs.length - 1].focus();
            }
        });
    });



    // Checkbox

    // Optional: Custom JS for demo (focus ring on keyboard)
    const checkbox = document.getElementById('customCheckbox');
    checkbox.addEventListener('focus', function() {
        this.parentNode.querySelector('.simpui-box').classList.add('simpui-focus');
    });
    checkbox.addEventListener('blur', function() {
        this.parentNode.querySelector('.simpui-box').classList.remove('simpui-focus');
    });





    // Modal
        const simpuiOpenBtn = document.getElementById('simpui-open-modal-btn');
    const simpuiModalBackdrop = document.getElementById('simpui-modal-backdrop');
    const simpuiCloseBtn = document.getElementById('simpui-close-modal-btn');
    const simpuiCancelBtn = document.getElementById('simpui-cancel-btn');
    const simpuiConfirmBtn = document.getElementById('simpui-confirm-btn');
    const simpuiDialogPanel = simpuiModalBackdrop.querySelector('.simpui-dialog-panel');

    function simpuiOpenModal() {
      simpuiModalBackdrop.style.display = 'flex';
      simpuiDialogPanel.focus();
      document.body.style.overflow = 'hidden';
    }
    function simpuiCloseModal() {
      simpuiModalBackdrop.style.display = 'none';
      document.body.style.overflow = '';
      simpuiOpenBtn.focus();
    }

    simpuiOpenBtn.addEventListener('click', simpuiOpenModal);
    simpuiCloseBtn.addEventListener('click', simpuiCloseModal);
    simpuiCancelBtn.addEventListener('click', simpuiCloseModal);
    simpuiConfirmBtn.addEventListener('click', () => {
      alert('Confirmed!');
      simpuiCloseModal();
    });

    // Close on backdrop click
    simpuiModalBackdrop.addEventListener('mousedown', function(e) {
      if (e.target === simpuiModalBackdrop) {
        simpuiCloseModal();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (simpuiModalBackdrop.style.display === 'flex' && e.key === 'Escape') {
        simpuiCloseModal();
      }
    });










    // Add new functions here...



});







    // Multi modal

   const multimodalBackdrop = document.getElementById("simpui-multimodal-backdrop");
    const multimodalPanels = document.querySelectorAll(".simpui-multimodal-panel");
    let simpuiMultimodalCurrent = 1;

    function simpuiMultimodalOpen() {
      multimodalBackdrop.style.display = "flex";
      simpuiMultimodalShowStep(simpuiMultimodalCurrent);
      document.body.style.overflow = "hidden";
    }

    function simpuiMultimodalClose() {
      multimodalBackdrop.style.display = "none";
      document.body.style.overflow = "";
      simpuiMultimodalCurrent = 1;
      simpuiMultimodalShowStep(simpuiMultimodalCurrent);
    }

    function simpuiMultimodalNext() {
      if (simpuiMultimodalCurrent < multimodalPanels.length) {
        simpuiMultimodalCurrent++;
        simpuiMultimodalShowStep(simpuiMultimodalCurrent);
      }
    }

    function simpuiMultimodalPrev() {
      if (simpuiMultimodalCurrent > 1) {
        simpuiMultimodalCurrent--;
        simpuiMultimodalShowStep(simpuiMultimodalCurrent);
      }
    }

    function simpuiMultimodalShowStep(step) {
      multimodalPanels.forEach(panel => {
        panel.classList.remove("active");
        if (parseInt(panel.dataset.step) === step) {
          panel.classList.add("active");
        }
      });
    }

    function simpuiMultimodalConfirm() {
      alert("Confirmed!");
      simpuiMultimodalClose();
    }

    document.getElementById("simpui-multimodal-open-btn").addEventListener("click", simpuiMultimodalOpen);

    // Backdrop close
    multimodalBackdrop.addEventListener("mousedown", e => {
      if (e.target === multimodalBackdrop) {
        simpuiMultimodalClose();
      }
    });

    // Escape key close
    document.addEventListener("keydown", e => {
      if (multimodalBackdrop.style.display === "flex" && e.key === "Escape") {
        simpuiMultimodalClose();
      }
    });







// Toast
function showToast(title, subtitle) {
    const container = document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.className = "toast";

    toast.innerHTML = `
        <div class="toast-content">
          <div class="toast-title">${title}</div>
          <div class="toast-subtitle">${subtitle}</div>
        </div>
        <div class="toast-action">
          <button onclick="undoToast(this)">Undo</button>
        </div>
      `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "fadeOut 0.3s ease forwards";
        toast.addEventListener("animationend", () => toast.remove());
    }, 5000);
}

function undoToast(button) {
    const toast = button.closest(".toast");
    alert("Undo clicked!");
    toast.remove();
}


