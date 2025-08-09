/*!
 * SimpUI CSS: A simple UI component JS library
 * Author: A. M. Reasad Azim Bappy
 * License: GPL-3.0
 * Version: 1.0
 */

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
    const labelTextSpan = label?.querySelector('#documents-label-text');

    if (fileInput && labelTextSpan) {
        fileInput.addEventListener("change", function () {
            let labelText = "No files chosen";
            if (this.files.length === 1) {
                labelText = this.files[0].name;
            } else if (this.files.length > 1) {
                labelText = `${this.files.length} files selected`;
            }
            labelTextSpan.textContent = labelText;
        });
    }



    // Show error

    const formGroups = document.querySelectorAll(".simpui-form-group input, .simpui-form-group textarea");

    formGroups.forEach(field => {
        field.addEventListener("invalid", () => {

            // field.parentElement.classList.add("has-error");
            field.closest('.simpui-form-group')?.classList.add('has-error'); // make sure error added to the simpui-from-group

            // Select dropdown validation
            const form = document.querySelector('form');

            let customValid = true;

            const customSelects = form.querySelectorAll('.simpui-form-group input[type="hidden"][required]');
            customSelects.forEach(hiddenInput => {
                const formGroup = hiddenInput.closest('.simpui-form-group');
                if (!hiddenInput.value) {
                    formGroup.classList.add('has-error');
                    customValid = false;
                } else {
                    formGroup.classList.remove('has-error');
                }
            });
            // END - Select dropdown validation



            // OTP Validation
            const formSelector = document.querySelector('form');
            const otpInputs = formSelector.querySelectorAll('.simpui-otp-input');
            const otpContainer = formSelector.querySelector('.simpui-otp-container');
            const formGroup = otpContainer.closest('.simpui-form-group'); // ⬅️ FIXED: go to parent

            function validateOtp() {
                const allFilled = Array.from(otpInputs).every(input => input.value.trim() !== '');
                if (allFilled) {
                    formGroup.classList.remove('has-error');
                } else {
                    formGroup.classList.add('has-error');
                }
            }

            otpInputs.forEach(input => {
                validateOtp();
                input.addEventListener('input', validateOtp);
                input.addEventListener('paste', validateOtp);
            });
            // END - OTP Validation


            // Check radio group validation

            const radioGroups = document.querySelectorAll('.simpui-radio-group');

            radioGroups.forEach(group => {
                const radios = group.querySelectorAll('input[type="radio"]');
                if (radios.length === 0) return;

                const groupName = radios[0].name;
                const formGroup = group.closest('.simpui-form-group');

                // Initial validation
                const isChecked = document.querySelector(`input[name="${groupName}"]:checked`);
                if (!isChecked) {
                    formGroup.classList.add('has-error');
                } else {
                    formGroup.classList.remove('has-error');
                }

                // Live update: remove has-error on change
                radios.forEach(radio => {
                    radio.addEventListener('change', () => {
                        const selected = document.querySelector(`input[name="${groupName}"]:checked`);
                        if (selected) {
                            formGroup.classList.remove('has-error');
                        }
                    });
                });
            });

            // End -  Check radio group validation



            // Checkbox validation
            const checkboxes = document.querySelectorAll('.simpui-form-group input[type="checkbox"][required]');

            checkboxes.forEach(checkbox => {
                const group = checkbox.closest('.simpui-form-group');

                // Handle invalid on submit
                checkbox.addEventListener('invalid', () => {
                    group.classList.add('has-error');
                });

                // Handle live change
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        group.classList.remove('has-error');
                    } else {
                        group.classList.add('has-error');
                    }
                });
            });
            // END - Checkbox validation


        });
        field.addEventListener("input", () => {
            field.parentElement.classList.remove("has-error");
        });
    });






    // Select dropdown validation
    document.querySelectorAll(".simpui-select").forEach(select => {
        const options = select.querySelectorAll(".simpui-options span");
        const hiddenInput = select.closest(".simpui-dropdown-wrapper").querySelector('input[type="hidden"]');
        const formGroup = select.closest(".simpui-form-group");
        const selectedText = select.querySelector(".simpui-selected-text");

        options.forEach(option => {
            option.addEventListener("click", () => {
                const value = option.getAttribute("data-value");
                const label = option.textContent.trim();

                hiddenInput.value = value;
                selectedText.textContent = label;

                // Live remove has-error if valid
                if (value) {
                    formGroup.classList.remove("has-error");
                }
            });
        });
    });
    // END - Select dropdown validation







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

                // Add class `selected` to change the chosen value color
                if(this.getAttribute("data-value") != ''){
                    const selectedText = trigger.querySelector('.simpui-selected-text');
                    if (selectedText) {
                        selectedText.classList.add('selected');
                    }
                }else{
                    const selectedText = trigger.querySelector('.simpui-selected-text');
                    if (selectedText) {
                        selectedText.classList.remove('selected');
                    }
                }

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
                    : "Select";

                // Add class `selected` to change the chosen value color
                if(selected.length > 0){
                    const selectedText = trigger.querySelector('.simpui-selected-text');
                    if (selectedText) {
                        selectedText.classList.add('selected');
                    }
                }else{
                    const selectedText = trigger.querySelector('.simpui-selected-text');
                    if (selectedText) {
                        selectedText.classList.remove('selected');
                    }
                }
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

    const checkbox = document.getElementById('customCheckbox');

    if (checkbox) {
        checkbox.addEventListener('focus', function () {
            const box = this.parentNode.querySelector('.simpui-box');
            if (box) box.classList.add('simpui-focus');
        });

        checkbox.addEventListener('blur', function () {
            const box = this.parentNode.querySelector('.simpui-box');
            if (box) box.classList.remove('simpui-focus');
        });
    }






    // Modal
    const simpuiOpenBtn = document.getElementById('simpui-open-modal-btn');
    const simpuiModalBackdrop = document.getElementById('simpui-modal-backdrop');
    const simpuiCloseBtn = document.getElementById('simpui-close-modal-btn');
    const simpuiCancelBtn = document.getElementById('simpui-cancel-btn');
    const simpuiConfirmBtn = document.getElementById('simpui-confirm-btn');
    const simpuiDialogPanel = simpuiModalBackdrop?.querySelector('.simpui-dialog-panel');

    function simpuiOpenModal() {
        if (simpuiModalBackdrop) {
            simpuiModalBackdrop.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            simpuiDialogPanel?.focus();
        }
    }

    function simpuiCloseModal() {
        if (simpuiModalBackdrop) {
            simpuiModalBackdrop.style.display = 'none';
            document.body.style.overflow = '';
            simpuiOpenBtn?.focus();
        }
    }

    // Attach event listeners only if the elements exist
    simpuiOpenBtn?.addEventListener('click', simpuiOpenModal);
    simpuiCloseBtn?.addEventListener('click', simpuiCloseModal);
    simpuiCancelBtn?.addEventListener('click', simpuiCloseModal);
    simpuiConfirmBtn?.addEventListener('click', () => {
        alert('Confirmed!');
        simpuiCloseModal();
    });

    // Close on backdrop click
    simpuiModalBackdrop?.addEventListener('mousedown', function(e) {
        if (e.target === simpuiModalBackdrop) {
            simpuiCloseModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (simpuiModalBackdrop?.style.display === 'flex' && e.key === 'Escape') {
            simpuiCloseModal();
        }
    });










    // Add new functions here...



});






// Hover Card
const trigger = document.getElementById("hoverTrigger");
const card = document.getElementById("hoverCard");
const wrapper = document.getElementById("hoverWrapper");

function adjustHoverCardPosition() {
    if (!trigger || !card) return;

    const cardRect = card.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();

    const viewportWidth = window.innerWidth;

    // Reset adjustments
    card.classList.remove("left-adjust", "right-adjust");

    // Check if card will overflow on the right
    if (triggerRect.left + card.offsetWidth / 2 > viewportWidth) {
        card.classList.add("left-adjust"); // move it to the left
    }
    // Check if card will overflow on the left
    else if (triggerRect.left - card.offsetWidth / 2 < 0) {
        card.classList.add("right-adjust"); // move it to the right
    }
}

// Only attach listeners if elements exist
if (trigger && card) {
    trigger.addEventListener("mouseenter", () => {
        card.classList.add("visible");
        adjustHoverCardPosition();
    });

    trigger.addEventListener("mouseleave", () => {
        card.classList.remove("visible");
    });

    card.addEventListener("mouseenter", () => {
        card.classList.add("visible");
    });

    card.addEventListener("mouseleave", () => {
        card.classList.remove("visible");
    });

    window.addEventListener("resize", adjustHoverCardPosition);
}



// Multi modal

const multimodalBackdrop = document.getElementById("simpui-multimodal-backdrop");
const multimodalPanels = document.querySelectorAll(".simpui-multimodal-panel");
const multimodalOpenBtn = document.getElementById("simpui-multimodal-open-btn");
let simpuiMultimodalCurrent = 1;

function simpuiMultimodalOpen() {
    if (!multimodalBackdrop) return;
    multimodalBackdrop.style.display = "flex";
    simpuiMultimodalShowStep(simpuiMultimodalCurrent);
    document.body.style.overflow = "hidden";
}

function simpuiMultimodalClose() {
    if (!multimodalBackdrop) return;
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

// Attach listeners only if elements exist
multimodalOpenBtn?.addEventListener("click", simpuiMultimodalOpen);

multimodalBackdrop?.addEventListener("mousedown", e => {
    if (e.target === multimodalBackdrop) {
        simpuiMultimodalClose();
    }
});

document.addEventListener("keydown", e => {
    if (multimodalBackdrop?.style.display === "flex" && e.key === "Escape") {
        simpuiMultimodalClose();
    }
});







// SimpUI Toast
function showSimpuiToast(title, subtitle) {
    const container = document.getElementById("simpui-toast-container");

    const toast = document.createElement("div");
    toast.className = "simpui-toast";

    toast.innerHTML = `
        <div class="simpui-toast-content">
          <div class="simpui-toast-title">${title}</div>
          <div class="simpui-toast-subtitle">${subtitle}</div>
        </div>
        <div class="simpui-toast-action">
          <button class="simpui-btn simpui-toast-action-btn sm" onclick="undoSimpuiToast(this)">✕</button>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "simpui-fadeOut 0.3s ease forwards";
        toast.addEventListener("animationend", () => toast.remove());
    }, 3000);
}

function undoSimpuiToast(button) {
    const toast = button.closest(".simpui-toast");
    // alert("Undo clicked!");
    toast.remove();
}



// Toggle dark mode
document.querySelectorAll('.toggle-dark-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.body.classList.toggle('dark');
    });
});


// Badge
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('simpui-badge-close')) {
        e.target.closest('.simpui-badge').remove();
    }
});




// Dropdown Button
document.querySelectorAll(".simpui-dropdown-btn-wrapper").forEach(wrapper => {
    const dropdownBtn = wrapper.querySelector(".simpui-dropdown-button");
    const copyBtn = wrapper.querySelector(".simpui-dropdown-button-main");
    const dropdown = wrapper.querySelector(".dropdown-menu");
    const icon = wrapper.querySelector(".icon");

    const arrow = wrapper.querySelector(".simpui-dropdown-button-arrow");
    arrow.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("show");
    });

    copyBtn.addEventListener("click", () => {
        icon.classList.remove("icon-copy");
        icon.classList.add("icon-check");
        icon.style.transform = "scale(1.2)";
        icon.style.opacity = "0.8";

        setTimeout(() => {
            icon.classList.remove("icon-check");
            icon.classList.add("icon-copy");
            icon.style.transform = "scale(1)";
            icon.style.opacity = "1";
        }, 1500);
    });

    dropdown.querySelectorAll("div").forEach(option => {
        option.addEventListener("click", () => {
            alert("Selected: " + option.textContent);
            dropdown.classList.remove("show");
        });
    });
});

document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown-menu").forEach(menu => {
        menu.classList.remove("show");
    });
});





// Option Button

document.querySelectorAll(".simpui-option-button-wrapper").forEach(wrapper => {
    const button = wrapper.querySelector(".simpui-option-button");
    const menu = wrapper.querySelector(".simpui-option-button-menu");

    button.addEventListener("click", (e) => {
        e.stopPropagation();
        // Close all others first
        document.querySelectorAll(".simpui-option-button-menu").forEach(m => m.classList.remove("show"));
        menu.classList.toggle("show");
    });

    menu.querySelectorAll("div").forEach(item => {
        item.addEventListener("click", () => {
            alert("Selected: " + item.textContent);
            menu.classList.remove("show");
        });
    });
});

document.addEventListener("click", () => {
    document.querySelectorAll(".simpui-option-button-menu").forEach(menu => {
        menu.classList.remove("show");
    });
});

