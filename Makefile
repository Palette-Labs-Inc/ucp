SHELL := /bin/bash
.DEFAULT_GOAL := help

# --- paths ---
UCP_SPEC_DIR := $(CURDIR)/spec
JS_SDK_DIR := $(CURDIR)/packages/js-sdk
PY_SDK_DIR := $(CURDIR)/packages/python-sdk
SAMPLES_DIR := $(CURDIR)/apps/samples
CONFORMANCE_DIR := $(CURDIR)/packages/conformance

# DB paths used by UCP sample server + conformance (matches upstream expectations)
UCP_TEST_DIR := /tmp/ucp_test
PRODUCTS_DB := $(UCP_TEST_DIR)/products.db
TX_DB := $(UCP_TEST_DIR)/transactions.db

.PHONY: help
help:
	@echo "Targets:"
	@echo "  make init                 - init submodules (no-op for subtrees) + tooling"
	@echo "  make update-upstream       - pull latest upstream into subtrees"
	@echo "  make generate              - run all spec + SDK generators"
	@echo "  make spec-conformance-sdks - spec types -> conformance -> SDKs"
	@echo "  make build-js-sdk          - build js-sdk + (re)generate models from ./spec"
	@echo "  make build-python-sdk      - build python-sdk + (re)generate models from ./spec"
	@echo "  make run-samples-server    - run UCP sample python server locally"
	@echo "  make test-conformance      - run conformance tests against sample server"
	@echo "  make fmt                   - run formatting across TS + Python (if present)"
	@echo "  make test                  - run all tests (ts + conformance)"

# --- init ---
.PHONY: init
init:
	@./scripts/init_upstream.sh
	@./scripts/install_tooling.sh

# --- upstream sync (subtrees) ---
.PHONY: update-upstream
update-upstream:
	@./scripts/update_upstream.sh

# --- generators ---
.PHONY: generate
generate:
	@pnpm -C spec install
	@pnpm run generate:ts
	@./scripts/js_sdk_build.sh "$(UCP_SPEC_DIR)"
	@./scripts/python_sdk_build.sh "$(UCP_SPEC_DIR)"

.PHONY: spec-conformance-sdks
spec-conformance-sdks:
	@./scripts/spec_conformance_sdks.sh

# --- sdk builds ---
.PHONY: build-js-sdk
build-js-sdk:
	@./scripts/js_sdk_build.sh "$(UCP_SPEC_DIR)"

.PHONY: build-python-sdk
build-python-sdk:
	@./scripts/python_sdk_build.sh "$(UCP_SPEC_DIR)"

# --- run sample merchant server ---
.PHONY: run-samples-server
run-samples-server:
	@mkdir -p "$(UCP_TEST_DIR)"
	@./scripts/run_samples_server.sh "$(PRODUCTS_DB)" "$(TX_DB)"

# --- conformance ---
.PHONY: test-conformance
test-conformance:
	@mkdir -p "$(UCP_TEST_DIR)"
	@./scripts/run_conformance.sh "$(PRODUCTS_DB)" "$(TX_DB)" "$(SAMPLES_DIR)" "$(CONFORMANCE_DIR)" "$(PY_SDK_DIR)"

# --- repo tests (your TS apps/packages) ---
.PHONY: test-ts
test-ts:
	@pnpm -r test

.PHONY: test
test: test-ts test-conformance

.PHONY: fmt
fmt:
	@pnpm -r lint || true
	@pnpm -r format || true
	@./scripts/python_fmt.sh || true
