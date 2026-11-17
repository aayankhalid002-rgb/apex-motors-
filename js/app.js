(() => {
  "use strict";

  const grid = document.querySelector("#grid");
  const search = document.querySelector("#search");
  const sort = document.querySelector("#sort");
  const empty = document.querySelector("#empty");
  const modal = document.querySelector("#modal");
  const details = document.querySelector("#details");
  const menuButton = document.querySelector("#menu");
  const nav = document.querySelector("#nav");
  const form = document.querySelector("#form");
  let activeFilter = "All";

  function renderCars() {
    const query = search.value.trim().toLowerCase();
    let visibleCars = cars.filter(car => {
      const matchesType = activeFilter === "All" || car.type === activeFilter;
      const searchable = `${car.name} ${car.type} ${car.year}`.toLowerCase();
      return matchesType && searchable.includes(query);
    });

    if (sort.value === "low") visibleCars.sort((a, b) => a.price - b.price);
    if (sort.value === "high") visibleCars.sort((a, b) => b.price - a.price);
    if (sort.value === "year") visibleCars.sort((a, b) => b.year - a.year);

    grid.innerHTML = visibleCars.map(car => `
      <article class="car reveal">
        <div class="photo">
          <img src="${car.img}" alt="${car.name}" loading="lazy"
            onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=80'">
          <span class="tag">${car.tag}</span>
        </div>
        <div class="carbody">
          <div class="meta"><span>${car.type.toUpperCase()}</span><span>${car.year} MODEL</span></div>
          <h3>${car.name}</h3>
          <div class="carfoot">
            <b class="price">${car.priceText}</b>
            <button class="details" type="button" data-id="${car.id}" aria-label="View details for ${car.name}">VIEW DETAILS <span>↗</span></button>
          </div>
        </div>
      </article>`).join("");

    empty.hidden = visibleCars.length !== 0;
  }

  function closeModal() {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  function openDetails(carId) {
    const car = cars.find(item => item.id === Number(carId));
    if (!car) return;

    details.innerHTML = `
      <img src="${car.img}" alt="${car.name}">
      <section>
        <small class="kicker">${car.tag} / ${car.type.toUpperCase()}</small>
        <h2>${car.name}</h2>
        <b class="price">${car.priceText}</b>
        <p>${car.desc}</p>
        <div class="specs">
          <div><small>MODEL YEAR</small><b>${car.year}</b></div>
          <div><small>MILEAGE</small><b>${car.km}</b></div>
          <div><small>FUEL</small><b>${car.fuel}</b></div>
          <div><small>ENGINE</small><b>${car.engine}</b></div>
        </div>
        <a class="goldbtn" href="#contact" id="ask">ENQUIRE ABOUT THIS CAR ↗</a>
      </section>`;

    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    document.querySelector("#ask").addEventListener("click", () => {
      interest.value = car.name;
      closeModal();
    });
    document.querySelector("#close").focus();
  }

  document.querySelector("#filters").addEventListener("click", event => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    activeFilter = button.dataset.filter;
    document.querySelectorAll("#filters button").forEach(item => {
      item.classList.toggle("active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
    renderCars();
  });

  search.addEventListener("input", renderCars);
  sort.addEventListener("change", renderCars);
  grid.addEventListener("click", event => {
    const button = event.target.closest("[data-id]");
    if (button) openDetails(button.dataset.id);
  });

  document.querySelector("#close").addEventListener("click", closeModal);
  document.querySelector(".backdrop").addEventListener("click", closeModal);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.classList.contains("open")) closeModal();
  });

  const interest = document.querySelector("#interest");
  cars.forEach(car => {
    const option = document.createElement("option");
    option.value = car.name;
    option.textContent = car.name;
    interest.append(option);
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const formData = new FormData(form);
    const customerName = String(formData.get("name") || "").trim();
    document.querySelector("#feedback").textContent =
      `Thank you, ${customerName}. Your demo enquiry is confirmed on this page only.`;
    form.reset();
  });

  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation");
    });
  });

  // Keep the desktop/mobile navigation state in sync with the section in view.
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        nav.querySelectorAll("a").forEach(link => {
          const active = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("active", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-35% 0px -55% 0px" });

    ["home", "inventory", "about", "services", "contact"].forEach(id => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }

  // Reveal content as it enters the viewport; reduced-motion users see content immediately.
  const revealTargets = document.querySelectorAll(".about, .inventory, .feature, .services, .contact, .servicegrid article");
  if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(element => {
      element.classList.add("js-reveal");
      revealObserver.observe(element);
    });
  }

  renderCars();
})();
