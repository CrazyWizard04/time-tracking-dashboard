const dashboardDiv = document.querySelector(".dashboard-container");
const controlBtns = document.querySelectorAll(".control-btn");

let selectedTime = "weekly";
let cachedData = null;

const fetchData = async () => {
  try {
    const res = await fetch("./data/data.json");
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }

    return await res.json();
  } catch (error) {
    console.error(error);
  }
};

const getData = async () => {
  if (cachedData) return cachedData;
  cachedData = await fetchData();
  return cachedData;
};

const mapData = async (selectedTime) => {
  const data = await getData();

  [...dashboardDiv.children].forEach((child) => {
    if (!child.classList.contains("keep")) {
      child.remove();
    }
  });

  const dashboardStats = data.map(({ title, timeframes }) => `
    <div class="stats-card" data-stats="${slugifyTitle(title)}">
      <div class="card-content">
        <div class="stats-wrapper">
          <h4 class="stats-title">${title}</h4>
          <img 
            src="images/icon-ellipsis.svg" 
            alt="" 
            class="stats-options"
          >
        </div>
        
        <div class="stats-wrapper">
          <p 
            class="current-time" 
            data-value="${timeframes[selectedTime]["current"]}"
          >
          </p>
          <p 
            class="previous-time"
            data-value="${timeframes[selectedTime]["previous"]}"
          >
            ${formatPreviousData(selectedTime, timeframes[selectedTime]["previous"])}
          </p>
        </div>
      </div>    
    </div>`).join("");

  dashboardDiv.insertAdjacentHTML("beforeend", dashboardStats);

  const previousEls = dashboardDiv.querySelectorAll(".current-time");

  previousEls.forEach((el) => {
    const value = el.dataset.value;
    countTo(el, value);
  })
};

const countTo = (el, target) => {
  if (el.animationId) cancelAnimationFrame(el.animationId);

  const start = performance.now();
  const duration = Math.min(1800, Math.max(800, target * 30));

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1- progress, 3);

    const value = Math.floor(eased * target);
    el.textContent = `${value}hrs`;

    if (progress < 1) {
      el.animationId = requestAnimationFrame(tick);
    }
  }

  el.animationId = requestAnimationFrame(tick);
}

const slugifyTitle = (title) => {
  return title.toLowerCase().trim().replace(/\s/g, "-");
};

const formatPreviousData = (selectedTime, timeData) => {
  let formattedText;

  switch (selectedTime) {
    case "daily":
      formattedText = "Last Day";
      break;
    case "weekly":
      formattedText = "Last Week";
      break;
    case "monthly":
      formattedText = "Last Month";
      break;
  }

  return formattedText + ` - ${timeData}hrs`;
};

controlBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const dataTime = btn.dataset.time;
    if (dataTime === selectedTime) return;

    selectedTime = dataTime;
    toggleActiveButton();

    mapData(selectedTime);
  });
});

const toggleActiveButton = () => {
  controlBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.time === selectedTime);
  });
};

mapData(selectedTime);
