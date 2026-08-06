"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        document
            .querySelectorAll(
                "[data-date-picker]"
            )
            .forEach(
                initializeDatePicker
            );

    }
);


function initializeDatePicker(
    root
) {

    const elements = {

        value:
            root.querySelector(
                "[data-date-value]"
            ),

        input:
            root.querySelector(
                "[data-date-input]"
            ),

        toggle:
            root.querySelector(
                "[data-date-toggle]"
            ),

        dropdown:
            root.querySelector(
                "[data-date-dropdown]"
            ),

        body:
            root.querySelector(
                "[data-date-body]"
            ),

        weekdays:
            root.querySelector(
                "[data-date-weekdays]"
            ),

        period:
            root.querySelector(
                "[data-date-period]"
            ),

        previous:
            root.querySelector(
                "[data-date-previous]"
            ),

        next:
            root.querySelector(
                "[data-date-next]"
            ),

        previousLarge:
            root.querySelector(
                "[data-date-previous-large]"
            ),

        nextLarge:
            root.querySelector(
                "[data-date-next-large]"
            ),

        today:
            root.querySelector(
                "[data-date-today]"
            ),

        clear:
            root.querySelector(
                "[data-date-clear]"
            )

    };


    const today =
        startOfDay(
            new Date()
        );

    const initialDate =
        parseIsoDate(
            elements.value?.value
        );

    const state = {

        selectedDate:
            initialDate,

        viewDate:
            initialDate
                ? new Date(initialDate)
                : new Date(today),

        view:
            "day"

    };


    renderInput();

    bindEvents();

    render();


    function bindEvents() {

        elements.toggle
            ?.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    toggleDropdown();

                }
            );


        elements.input
            ?.addEventListener(
                "focus",
                () => {

                    openDropdown();

                }
            );


        elements.input
            ?.addEventListener(
                "input",
                event => {

                    const digits =
                        event.target.value
                            .replace(
                                /\D/g,
                                ""
                            )
                            .slice(
                                0,
                                8
                            );

                    event.target.value =
                        formatTypingDigits(
                            digits
                        );

                }
            );


        elements.input
            ?.addEventListener(
                "blur",
                () => {

                    normalizeTypedValue();

                }
            );


        elements.input
            ?.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        normalizeTypedValue();

                        closeDropdown();

                    }

                    if (
                        event.key ===
                        "Escape"
                    ) {

                        closeDropdown();

                    }

                }
            );


        elements.period
            ?.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    changeViewUp();

                }
            );


        elements.previous
            ?.addEventListener(
                "click",
                () => {

                    moveView(
                        -1,
                        false
                    );

                }
            );


        elements.next
            ?.addEventListener(
                "click",
                () => {

                    moveView(
                        1,
                        false
                    );

                }
            );


        elements.previousLarge
            ?.addEventListener(
                "click",
                () => {

                    moveView(
                        -1,
                        true
                    );

                }
            );


        elements.nextLarge
            ?.addEventListener(
                "click",
                () => {

                    moveView(
                        1,
                        true
                    );

                }
            );


        elements.today
            ?.addEventListener(
                "click",
                () => {

                    selectDate(
                        today
                    );

                }
            );


        elements.clear
            ?.addEventListener(
                "click",
                () => {

                    state.selectedDate =
                        null;

                    if (
                        elements.value
                    ) {

                        elements.value.value =
                            "";

                    }

                    if (
                        elements.input
                    ) {

                        elements.input.value =
                            "";

                    }

                    dispatchChange();

                    render();

                    closeDropdown();

                }
            );


        root.addEventListener(
            "click",
            event => {

                event.stopPropagation();

            }
        );


        document.addEventListener(
            "click",
            closeDropdown
        );

    }


    function openDropdown() {

        if (
            !elements.dropdown ||
            elements.input?.disabled ||
            elements.input?.readOnly
        ) {
            return;
        }

        elements.dropdown.hidden =
            false;

        elements.toggle?.setAttribute(
            "aria-expanded",
            "true"
        );

        render();

    }


    function closeDropdown() {

        if (
            !elements.dropdown
        ) {
            return;
        }

        elements.dropdown.hidden =
            true;

        elements.toggle?.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    function toggleDropdown() {

        if (
            elements.dropdown?.hidden
        ) {

            openDropdown();

        } else {

            closeDropdown();

        }

    }


    function render() {

        switch (
            state.view
        ) {

            case "month":

                renderMonthView();

                break;

            case "year":

                renderYearView();

                break;

            case "decade":

                renderDecadeView();

                break;

            default:

                renderDayView();

                break;

        }

    }


    function renderDayView() {

        elements.weekdays.hidden =
            false;

        elements.body.className =
            "date-picker__body";

        const year =
            state.viewDate
                .getFullYear();

        const month =
            state.viewDate
                .getMonth();

        elements.period.textContent =
            `Tháng ${month + 1} năm ${year}`;

        elements.body.innerHTML =
            "";

        const firstDay =
            new Date(
                year,
                month,
                1
            );

        const mondayIndex =
            (
                firstDay.getDay() +
                6
            ) % 7;

        const startDate =
            new Date(
                year,
                month,
                1 - mondayIndex
            );


        for (
            let index = 0;
            index < 42;
            index += 1
        ) {

            const date =
                new Date(
                    startDate
                );

            date.setDate(
                startDate.getDate() +
                index
            );

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "date-picker__day";

            button.textContent =
                String(
                    date.getDate()
                );

            if (
                date.getMonth() !==
                month
            ) {

                button.classList.add(
                    "is-outside"
                );

            }

            if (
                isSameDate(
                    date,
                    today
                )
            ) {

                button.classList.add(
                    "is-today"
                );

            }

            if (
                state.selectedDate &&
                isSameDate(
                    date,
                    state.selectedDate
                )
            ) {

                button.classList.add(
                    "is-selected"
                );

            }

            button.addEventListener(
                "click",
                () => {

                    selectDate(
                        date
                    );

                }
            );

            elements.body.appendChild(
                button
            );

        }

    }


    function renderMonthView() {

        elements.weekdays.hidden =
            true;

        elements.body.className =
            "date-picker__body is-month-view";

        const year =
            state.viewDate
                .getFullYear();

        elements.period.textContent =
            String(year);

        elements.body.innerHTML =
            "";

        const monthNames = [
            "Tháng 1",
            "Tháng 2",
            "Tháng 3",
            "Tháng 4",
            "Tháng 5",
            "Tháng 6",
            "Tháng 7",
            "Tháng 8",
            "Tháng 9",
            "Tháng 10",
            "Tháng 11",
            "Tháng 12"
        ];

        monthNames.forEach(
            (
                monthName,
                monthIndex
            ) => {

                const button =
                    document.createElement(
                        "button"
                    );

                button.type =
                    "button";

                button.className =
                    "date-picker__month";

                button.textContent =
                    monthName;

                if (
                    state.selectedDate &&
                    state.selectedDate
                        .getFullYear() ===
                        year &&
                    state.selectedDate
                        .getMonth() ===
                        monthIndex
                ) {

                    button.classList.add(
                        "is-selected"
                    );

                }

                button.addEventListener(
                    "click",
                    () => {

                        state.viewDate.setMonth(
                            monthIndex
                        );

                        state.view =
                            "day";

                        render();

                    }
                );

                elements.body.appendChild(
                    button
                );

            }
        );

    }


    function renderYearView() {

        elements.weekdays.hidden =
            true;

        elements.body.className =
            "date-picker__body is-year-view";

        const currentYear =
            state.viewDate
                .getFullYear();

        const startYear =
            Math.floor(
                currentYear / 10
            ) * 10;

        elements.period.textContent =
            `${startYear}-${startYear + 9}`;

        elements.body.innerHTML =
            "";

        for (
            let year =
                startYear - 1;
            year <=
                startYear + 10;
            year += 1
        ) {

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "date-picker__year";

            button.textContent =
                String(year);

            if (
                year < startYear ||
                year > startYear + 9
            ) {

                button.classList.add(
                    "is-outside"
                );

            }

            if (
                state.selectedDate &&
                state.selectedDate
                    .getFullYear() ===
                    year
            ) {

                button.classList.add(
                    "is-selected"
                );

            }

            button.addEventListener(
                "click",
                () => {

                    state.viewDate.setFullYear(
                        year
                    );

                    state.view =
                        "month";

                    render();

                }
            );

            elements.body.appendChild(
                button
            );

        }

    }


    function renderDecadeView() {

        elements.weekdays.hidden =
            true;

        elements.body.className =
            "date-picker__body is-decade-view";

        const currentYear =
            state.viewDate
                .getFullYear();

        const centuryStart =
            Math.floor(
                currentYear / 100
            ) * 100;

        elements.period.textContent =
            `${centuryStart}-${centuryStart + 99}`;

        elements.body.innerHTML =
            "";

        for (
            let decade =
                centuryStart - 10;
            decade <=
                centuryStart + 100;
            decade += 10
        ) {

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "date-picker__decade";

            button.textContent =
                `${decade}-${decade + 9}`;

            if (
                decade < centuryStart ||
                decade > centuryStart + 90
            ) {

                button.classList.add(
                    "is-outside"
                );

            }

            const selectedYear =
                state.selectedDate
                    ?.getFullYear();

            if (
                selectedYear >= decade &&
                selectedYear <=
                    decade + 9
            ) {

                button.classList.add(
                    "is-selected"
                );

            }

            button.addEventListener(
                "click",
                () => {

                    state.viewDate.setFullYear(
                        decade
                    );

                    state.view =
                        "year";

                    render();

                }
            );

            elements.body.appendChild(
                button
            );

        }

    }


    function changeViewUp() {

        if (
            state.view === "day"
        ) {

            state.view =
                "month";

        } else if (
            state.view === "month"
        ) {

            state.view =
                "year";

        } else if (
            state.view === "year"
        ) {

            state.view =
                "decade";

        }

        render();

    }


    function moveView(
        direction,
        large
    ) {

        const date =
            state.viewDate;

        if (
            state.view === "day"
        ) {

            date.setMonth(
                date.getMonth() +
                (
                    large
                        ? direction * 12
                        : direction
                )
            );

        } else if (
            state.view === "month"
        ) {

            date.setFullYear(
                date.getFullYear() +
                (
                    large
                        ? direction * 10
                        : direction
                )
            );

        } else if (
            state.view === "year"
        ) {

            date.setFullYear(
                date.getFullYear() +
                (
                    large
                        ? direction * 100
                        : direction * 10
                )
            );

        } else {

            date.setFullYear(
                date.getFullYear() +
                direction * 100
            );

        }

        render();

    }


    function selectDate(
        date
    ) {

        state.selectedDate =
            startOfDay(
                new Date(date)
            );

        state.viewDate =
            new Date(
                state.selectedDate
            );

        if (
            elements.value
        ) {

            elements.value.value =
                formatIsoDate(
                    state.selectedDate
                );

        }

        renderInput();

        dispatchChange();

        render();

        closeDropdown();

    }


    function normalizeTypedValue() {

        const rawValue =
            elements.input?.value
                .trim();

        if (!rawValue) {

            state.selectedDate =
                null;

            if (
                elements.value
            ) {

                elements.value.value =
                    "";

            }

            dispatchChange();

            return;

        }

        const date =
            parseVietnameseDate(
                rawValue
            );

        if (!date) {

            root.classList.add(
                "is-invalid"
            );

            elements.input?.setAttribute(
                "aria-invalid",
                "true"
            );

            return;

        }

        root.classList.remove(
            "is-invalid"
        );

        elements.input?.removeAttribute(
            "aria-invalid"
        );

        selectDate(
            date
        );

    }


    function renderInput() {

        if (
            !elements.input
        ) {
            return;
        }

        elements.input.value =
            state.selectedDate
                ? formatVietnameseDate(
                    state.selectedDate
                )
                : "";

    }


    function dispatchChange() {

        elements.value?.dispatchEvent(
            new Event(
                "change",
                {
                    bubbles:
                        true
                }
            )
        );

    }

}


/* =========================================================
   Helpers
   ========================================================= */

function formatTypingDigits(
    digits
) {

    if (
        digits.length <= 2
    ) {

        return digits;

    }

    if (
        digits.length <= 4
    ) {

        return (
            digits.slice(0, 2) +
            "/" +
            digits.slice(2)
        );

    }

    return (
        digits.slice(0, 2) +
        "/" +
        digits.slice(2, 4) +
        "/" +
        digits.slice(4)
    );

}


function parseVietnameseDate(
    value
) {

    const digits =
        String(value)
            .replace(
                /\D/g,
                ""
            );

    let day;
    let month;
    let year;


    if (
        digits.length === 6
    ) {

        day =
            Number(
                digits.slice(0, 2)
            );

        month =
            Number(
                digits.slice(2, 4)
            );

        const shortYear =
            Number(
                digits.slice(4, 6)
            );

        year =
            shortYear <= 49
                ? 2000 + shortYear
                : 1900 + shortYear;

    } else if (
        digits.length === 8
    ) {

        day =
            Number(
                digits.slice(0, 2)
            );

        month =
            Number(
                digits.slice(2, 4)
            );

        year =
            Number(
                digits.slice(4, 8)
            );

    } else {

        return null;

    }


    const date =
        new Date(
            year,
            month - 1,
            day
        );


    if (
        date.getFullYear() !==
            year ||
        date.getMonth() !==
            month - 1 ||
        date.getDate() !==
            day
    ) {

        return null;

    }

    return date;

}


function parseIsoDate(
    value
) {

    if (
        !value
    ) {
        return null;
    }

    const match =
        String(value)
            .match(
                /^(\d{4})-(\d{2})-(\d{2})/
            );

    if (!match) {
        return null;
    }

    const year =
        Number(match[1]);

    const month =
        Number(match[2]);

    const day =
        Number(match[3]);

    const date =
        new Date(
            year,
            month - 1,
            day
        );

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;

}


function formatVietnameseDate(
    date
) {

    const day =
        String(
            date.getDate()
        )
            .padStart(
                2,
                "0"
            );

    const month =
        String(
            date.getMonth() + 1
        )
            .padStart(
                2,
                "0"
            );

    const year =
        date.getFullYear();

    return `${day}/${month}/${year}`;

}


function formatIsoDate(
    date
) {

    const day =
        String(
            date.getDate()
        )
            .padStart(
                2,
                "0"
            );

    const month =
        String(
            date.getMonth() + 1
        )
            .padStart(
                2,
                "0"
            );

    return (
        `${date.getFullYear()}-` +
        `${month}-` +
        `${day}`
    );

}


function startOfDay(
    date
) {

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

}


function isSameDate(
    firstDate,
    secondDate
) {

    return (
        firstDate.getFullYear() ===
            secondDate.getFullYear() &&
        firstDate.getMonth() ===
            secondDate.getMonth() &&
        firstDate.getDate() ===
            secondDate.getDate()
    );

}