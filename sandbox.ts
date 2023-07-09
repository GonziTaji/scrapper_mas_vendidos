(async () => {
    try {
        const data = await require('request-promise')({
            url: 'https://www.amazon.com/',
            proxy: 'http://qsjdbvxw-rotate:i0tvbapxt156@p.webshare.io:80'
        })

        console.log(data);
    } catch (e) {
        console.error(e);
    }

})();