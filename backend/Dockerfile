# pull official base image
FROM python:3.11

# accept arguments
ARG PIP_REQUIREMENTS=production.txt

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install dependencies
RUN pip install --upgrade pip setuptools

# create user for the Django project
RUN useradd -ms /bin/bash appuser

# Debugging statement
RUN echo "PIP_REQUIREMENTS is set to: ${PIP_REQUIREMENTS}"

# set current user
USER appuser

# set work directory
WORKDIR /home/appuser

# create and activate virtual environment
RUN python3 -m venv env

# copy and install pip requirements
COPY --chown=appuser ./src/requirements /home/appuser/requirements/
RUN ./env/bin/pip3 install -r /home/appuser/requirements/${PIP_REQUIREMENTS}

# copy Django project files
COPY --chown=appuser ./src .

# Create mediafiles directory
RUN mkdir -p /home/appuser/mediafiles

# Adjust ownership and permissions for the mediafiles directory
USER root
RUN chown -R appuser:appuser /home/appuser/mediafiles

# ensure the appuser has necessary permissions
USER appuser

