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
ANVIL_COMPOSE_FILE := $(CURDIR)/infra/docker-compose.yml
ERC8004_DIR := $(CURDIR)/contracts/erc8004
ANVIL_DOCKER_URL := http://anvil:8545
ANVIL_DEPLOYER_KEY := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
ANVIL_AGENT_KEY := 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
AGENT_DOMAIN := agent.local

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
	@echo "  make anvil                 - run Anvil via docker-compose"
	@echo "  make anvil-fg              - run Anvil in the foreground"
	@echo "  make anvil-down            - stop Anvil via docker-compose"
	@echo "  make anvil-logs            - tail Anvil logs"
	@echo "  make test-erc8004          - run ERC-8004 Foundry tests"
	@echo "  make deploy-erc8004        - deploy ERC-8004 to Anvil"
	@echo "  make seed-erc8004          - register a sample agent"
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

# --- anvil (docker) ---
.PHONY: check-docker
check-docker:
	@command -v docker >/dev/null 2>&1 || { \
		echo "Docker is required for this target. Install/start Docker Desktop."; \
		exit 1; \
	}

.PHONY: anvil
anvil: check-docker
	@./scripts/anvil_up.sh "$(ANVIL_COMPOSE_FILE)" detached

.PHONY: anvil-wait
anvil-wait: check-docker
	@echo "Waiting for anvil..."
	@until docker compose -f "$(ANVIL_COMPOSE_FILE)" exec -T anvil \
		cast block-number --rpc-url http://127.0.0.1:8545 >/dev/null 2>&1; do \
		sleep 0.2; \
	done
	@echo "anvil is ready."

.PHONY: anvil-fg
anvil-fg: check-docker
	@./scripts/anvil_up.sh "$(ANVIL_COMPOSE_FILE)" foreground

.PHONY: anvil-down
anvil-down: check-docker
	@./scripts/anvil_down.sh "$(ANVIL_COMPOSE_FILE)"

.PHONY: anvil-logs
anvil-logs: check-docker
	@./scripts/anvil_logs.sh "$(ANVIL_COMPOSE_FILE)"


# --- erc8004 (foundry) ---
.PHONY: test-erc8004
test-erc8004: check-docker anvil-wait
	@docker compose -f "$(ANVIL_COMPOSE_FILE)" run --rm foundry \
	  "cd /repo/contracts/erc8004 && forge test"

.PHONY: deploy-erc8004
deploy-erc8004: check-docker anvil-wait
	@mkdir -p "$(ERC8004_DIR)/broadcast"
	@docker compose -f "$(ANVIL_COMPOSE_FILE)" run --rm \
	  -e DEPLOYER_PRIVATE_KEY="$(ANVIL_DEPLOYER_KEY)" \
	  foundry "cd /repo/contracts/erc8004 && forge script script/DeployIdentityRegistry.s.sol:DeployIdentityRegistry \
	  --rpc-url $(ANVIL_DOCKER_URL) --broadcast"

.PHONY: seed-erc8004
seed-erc8004: check-docker anvil-wait
	@mkdir -p "$(ERC8004_DIR)/broadcast"
	@docker compose -f "$(ANVIL_COMPOSE_FILE)" run --rm \
	  -e AGENT_PRIVATE_KEY="$(ANVIL_AGENT_KEY)" \
	  -e AGENT_DOMAIN="$(AGENT_DOMAIN)" \
	  foundry "cd /repo/contracts/erc8004 && forge script script/SeedAgent.s.sol:SeedAgent \
	  --rpc-url $(ANVIL_DOCKER_URL) --broadcast"

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
