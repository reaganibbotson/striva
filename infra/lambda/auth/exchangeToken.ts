import { APIGatewayProxyHandler } from 'aws-lambda';
import axios from 'axios';

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';

export const handler: APIGatewayProxyHandler = async (event) => {
    const { code } = JSON.parse(event.body || '{}');

    if (!code) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Authorization code is required' }),
        };
    }

    try {
        const response = await axios.post(STRAVA_TOKEN_URL, {
            client_id: STRAVA_CLIENT_ID,
            client_secret: STRAVA_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
        });

        return {
            statusCode: 200,
            body: JSON.stringify(response.data),
        };
    } catch (error: any) {
        let message = error && error.response && error.response.data && error.response.data.message ? error.response.data.message : error.message;

        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to exchange token', details: message }),
        };
    }
};