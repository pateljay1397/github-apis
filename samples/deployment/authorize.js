import axios from "axios";

const authorize = async (authority, secret) => {
    try {
        console.log("Obtaining access token...");
        const payload = `client_id=imodeljs-developer-services-deploy&grant_type=client_credentials&scope=itwinjs-code-sandbox&client_secret=${encodeURIComponent(secret)}`;
        const response = await axios({
            baseURL: authority,
            url: "/connect/token",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Lenght": payload.length
            },
            data: payload
        });

        console.log("done.");
        return `${response.data.token_type} ${response.data.access_token}`;

    } catch (error) {
        console.error("Failed to get access token")
        if (error.response) {
            console.error(error.response.data);
            console.error(error.response.status);
            console.error(error.response.headers);
        } else {
            console.error(error.message);
        }
        return null;
    }
};

export default authorize;
