# xll: Universal Value Parameter

xll is a system that uniformly expresses the value of multiple currencies (fiat and cryptocurrencies). It represents the value of each asset in xll units and allows real-time updates and comparisons.

**Note: This project is a lighthearted fintech initiative. It is not intended to make a significant impact on the financial world, but rather to provide a bit of humor while reading economic news. For serious financial matters, please consult a real financial advisor who may not be as cheerful.**

## Project Purpose

The purpose of xll is to uniquely express value comparisons between different currencies and to unify the representation of value in global economic activities.

## Key Features

- Retrieval of price data for multiple currencies (fiat and cryptocurrencies)
- Calculation and display of xll value
- Providing the latest data within one hour
- Returning the last retrieved data if no data is available
- Data access via RESTful API

## Technology Stack

- Backend: Python (FastAPI)
- Database: PostgreSQL
- Deployment: Vercel
- Frontend: HTML, JavaScript

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/xll.git
   cd xll
   ```

2. Create and activate a virtual environment:

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install the required packages:

   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Create a `.env` file and set the necessary API keys and database URL.

5. Run the application locally:

   ```bash
   uvicorn app.main:app --reload
   ```

6. Access the application:
   Open `http://localhost:8000/static/index.html` in your browser.

## Deployment

The project is deployed using Vercel. The `vercel.json` file in the project root contains the necessary configuration for deployment.

## Scheduled Tasks

A maintenance script is scheduled to run periodically using crontab to update the data.

## Contribution Guidelines

1. Fork this repository.
2. Create a new feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Create a pull request.

## Contact

If you have any questions or suggestions, please reach out through the following methods:

1. Create a GitHub Issue
2. Use GitHub Discussions

We look forward to your contributions to improve the project as a member of the community.
