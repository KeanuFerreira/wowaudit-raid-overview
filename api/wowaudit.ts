export async function GET(request: Request) {
    //request wowaudit raids to check if it works
    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    myHeaders.append("Authorization", `Bearer ${process.env.WOWAUDIT_CREDENTIAL}`);

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
    };

    // read targetRoute from query params
    const {searchParams} = new URL(request.url);
    const route = searchParams.get('targetRoute');
    if (!route) {
        return new Response(JSON.stringify({error: 'No targetRoute provided'}), {status: 400});
    }
    const response = await fetch(`${process.env.WOWAUDIT_URL}/${route}`, requestOptions);
    const result = await response?.json();
    // return json response
    return new Response(JSON.stringify(result), {status: 200});
}
