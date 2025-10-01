export async function GET(request: Request) {
    console.log(request)

    //request wowaudit raids to check if it works
    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    myHeaders.append("Authorization", "a0a3875d2392fb8fc8a00a6ce116f2cbadd36a4f0199e6840bf7b16b670570f5");

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
    };

    const response = await fetch("https://wowaudit.com/v1/raids?include_past=false", requestOptions);
    const result = await response?.json();
    console.log(result)
    // return json
    return new Response(JSON.stringify(result), {status: 200});
}
