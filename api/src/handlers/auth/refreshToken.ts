import { APIGatewayProxyHandler } from 'aws-lambda';
import axios from 'axios';

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';

const handler: APIGatewayProxyHandler = async (event) => {
    const { refresh_token } = JSON.parse(event.body || '{}');

    if (!refresh_token) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Refresh token is required' }),
        };
    }

    try {
        const response = await axios.post(STRAVA_TOKEN_URL, {
            client_id: STRAVA_CLIENT_ID,
            client_secret: STRAVA_CLIENT_SECRET,
            refresh_token,
            grant_type: 'refresh_token',
        });

        return {
            statusCode: 200,
            body: JSON.stringify(response.data),
        };
    } catch (error: any) {
        let message = error && error.response && error.response.data && error.response.data.message ? error.response.data.message : error.message;

        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to refresh token', details: message }),
        };
    }
};

export default handler