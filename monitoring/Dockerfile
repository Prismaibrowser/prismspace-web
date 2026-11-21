FROM grafana/alloy:v1.22.0@sha256:9acc2529bc1edb7f5b2bd801dd8334ebc80c158e3a9e5526ecd7c9a273d43189

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
