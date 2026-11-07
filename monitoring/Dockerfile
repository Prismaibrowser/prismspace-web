FROM grafana/alloy:v1.21.3@sha256:8ab871206bd2d8f89277f53abffee5f452a293980788d52f85fa183a87a505a4

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
