const fetchData = async () => {
  const apiUrl = localStorage.getItem("apiUrl");
  if (apiUrl) {
    const respone = await fetch(`${apiUrl}/users`);
    const data = await respone.json();
    console.log(data);
  } else {
    window.location.href = "/api";
  }
};

fetchData();
