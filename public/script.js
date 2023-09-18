const fetchData = async () => {
    const apiUrl = localStorage.getItem("apiUrl");
    if (apiUrl) {
        const respone = await fetch(`${apiUrl}/users`);
        const data = await respone.json();
        console.log(data);
    } else {
        // window.location.href = "/api";
        const response = await fetch(`v1/chat/completions`);
        const readableStreamDefaultReader = response.body.getReader();

        const div = document.createElement("div");
        document.body.appendChild(div);

        const decoder = new TextDecoder();
        let value;
        while (!({value} = await readableStreamDefaultReader.read()).done) {
            div.innerHTML += decoder.decode(value)
        }

    }
};

fetchData();
