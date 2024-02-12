# Weather Archive

This project downloads and stores weather information for a given place every hour. The data is fetched from an external API and stored in CSV files, one for each city. The data is stored in the following format:

| Date | Location | Temperature | Description |
| --- | --- | --- | --- |
| 2024-02-12 21:02:17 | Gemeente Veenendaal | 3.79 | clear sky |

## Project Structure

The project is structured as follows:

- `main.py`: This is the main script that fetches the weather data and saves it to a CSV file.
- `archive/`: This directory contains the CSV files with the weather data for each city.
- `.github/workflows/ci.yml`: This file defines a GitHub Actions workflow that runs the `main.py` script every hour.
- `docker-compose.yml`: This file defines a Docker Compose service that runs the `main.py` script.
- `Dockerfile`: This file defines a Docker image that can be used to run the `main.py` script in a containerized environment.

## Environment Variables

The `main.py` script requires two environment variables:

- `WEATHER_API_KEY`: The API key for the weather data service. You can obtain an API key for free by signing up for an account at [OpenWeather](https://openweathermap.org/).
- `CITIES`: A comma-separated list of cities for which to fetch the weather data.

These environment variables can be set in the shell before running the `main.py` script, or they can be defined in the `docker-compose.yml` file if you are using Docker Compose.

## Running the Project

First, make sure your environment variables are set. Then, you can run the project using Python or Docker Compose.

```sh
cp .env.example .env

# or

export WEATHER_API_KEY=your_api_key
export CITIES=city1\ncity2\ncity3
```

You can run the project by executing the `main.py` script with Python:

```sh
python main.py
```

Alternatively, you can use Docker Compose to run the project:

```sh
docker-compose up
```

## License

This project is licensed under the MIT License. See the [`LICENSE`](LICENSE) file for more details.

![Weather Archive Banner](banner.webp)
