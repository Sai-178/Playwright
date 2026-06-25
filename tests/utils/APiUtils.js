class APiUtils {
    constructor(apiContext, loginPayload) {
        this.apiContext = apiContext;
        this.loginPayload = loginPayload;
        this.token = null;
    }

    async getToken() {
        const response = await this.apiContext.post(
            'https://rahulshettyacademy.com/api/ecom/auth/login',
            {
                data: this.loginPayload
            }
        );
        const responseBody = await response.json();
        this.token = responseBody.token;
        return this.token;
    }

    async createOrder(orderPayload) {
        if (!this.token) {
            await this.getToken();
        }

        const response = await this.apiContext.post(
            'https://rahulshettyacademy.com/api/ecom/order/create-order',
            {
                headers: {
                    'Authorization': this.token
                },
                data: orderPayload
            }
        );
        
        const responseBody = await response.json();
        const orderId = responseBody.orders && responseBody.orders.length > 0 ? responseBody.orders[0] : '';
        
        return {
            token: this.token,
            orderId: orderId,
            ...responseBody
        };
    }
}

module.exports = { APiUtils };
