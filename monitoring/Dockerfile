FROM grafana/alloy:v1.21.2@sha256:89a5a320168387336b9ac3c850609c3ba7757eadd4ae5f1d819deb35e9854b18

USER root

# The upstream image intentionally omits HTTP clients. Install only curl so
# the Compose healthcheck can probe Alloy's readiness endpoint.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY --chown=473:473 config.alloy /etc/alloy/config.alloy

USER 473:473

EXPOSE 12345

CMD ["run", "--server.http.listen-addr=0.0.0.0:12345", "--disable-reporting", "/etc/alloy/config.alloy"]
