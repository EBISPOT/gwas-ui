class HttpRequestEngine {

    static fetchRequest(request) {
        return fetch(request)
            .then((res) => {
                if (res.ok) {
                    if (request.method === 'POST'){
                        UI.launchToastNotification('Success: Data was Saved');
                    }
                    return res.json();
                }
                throw new Error('Something went wrong');
            })
            .then((data) => data)
            .catch(error => {

            });
    }

    static requestWithoutBody(uri, httpMethod) {
        let httpHeaders = new Headers();
        httpHeaders.append('Content-Type', 'application/json');
        httpHeaders.append('Authorisation', 'Bearer ');
        return  new Request(uri, {
            method: httpMethod,
            withCredentials: true,
            headers: httpHeaders
        });
    }


    static requestWithBody(uri, dataObj, httpMethod) {
        let httpHeaders = new Headers();
        httpHeaders.append('Content-Type', 'application/json');
        httpHeaders.append('Accept', 'application/json');
        return  new Request(uri, {
            method: httpMethod,
            withCredentials: true,
            headers: httpHeaders,
            body: JSON.stringify(dataObj)
        });
    }

    static fileUploadRequest(uri, dataObj, httpMethod) {
        let httpHeaders = new Headers();
        httpHeaders.append('Accept', 'application/json');
        return new Request(uri, {
            method: httpMethod,
            withCredentials: true,
            headers: httpHeaders,
            body: dataObj
        });
    }

}