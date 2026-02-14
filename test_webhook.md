# Test the Proxy Email Webhook

Use this curl command to simulate an email arriving at the proxy address.
Replace `ref-xyz@referkaro.com` with the ACTUAL proxy email you generated in the dashboard.

```bash
curl -X POST http://localhost:3000/api/webhooks/inbound-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ref-xyz@referkaro.com",
    "from": "recruiter@google.com",
    "subject": "Referral Application Received",
    "text": "Hey, I have referred you!"
  }'
```
