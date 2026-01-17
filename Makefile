SHELL := /bin/bash
.DEFAULT_GOAL := help

-include $(CURDIR)/.env

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
ENV_FILE ?= $(CURDIR)/.env
ENV_TEMPLATE := $(CURDIR)/.env.template
DOCKER_ENV_FILE := --env-file "$(ENV_FILE)"
ANVIL_HOST ?= 0.0.0.0
ANVIL_PORT ?= 8545
ANVIL_DOCKER_URL ?= http://anvil:$(ANVIL_PORT)
CHAIN_ID ?= 31337
ANVIL_DEPLOYER_KEY ?= 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
ANVIL_AGENT_KEY ?= 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
AGENT_DOMAIN ?= agent.local
SHOVEL_CONFIG_DIR := $(CURDIR)/infra/shovel
SHOVEL_OUTPUT_DIR := $(SHOVEL_CONFIG_DIR)/generated
SHOVEL_CONFIG := $(SHOVEL_OUTPUT_DIR)/ucp.local.json
SHOVEL_CONTRACTS_CONFIG := $(SHOVEL_CONFIG_DIR)/contracts.json

SHOVEL_PG_URL ?= postgres://postgres:postgres@postgres:5432/shovel
ETH_RPC_URL ?= $(ANVIL_DOCKER_URL)
SHOVEL_START_BLOCK ?= 0
PAYMENTS_START_BLOCK ?= 0

export SHOVEL_PG_URL CHAIN_ID ETH_RPC_URL SHOVEL_START_BLOCK
export PAYMENTS_START_BLOCK

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
	@echo "  make shovel-up             - start Shovel via docker-compose"
	@echo "  make shovel-logs           - tail Shovel logs"
	@echo "  make infra-up              - boot anvil + deploy + shovel"
	@echo "  make infra-down            - stop all infra services"
	@echo "  make infra-clean           - remove .env + generated shovel config"
	@echo "  make env-init              - create .env from .env.template if missing"
	@echo "  make test-erc8004          - run ERC-8004 Foundry tests"
	@echo "  make deploy-erc8004        - deploy ERC-8004 to Anvil"
	@echo "  make seed-erc8004          - register a sample agent"
	@echo "  make deploy-commerce-payments     - deploy payments escrow to Anvil"
	@echo "  make infra-check          - build ABIs + validate + config JSON"
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

.PHONY: env-init
env-init:
	@if [[ ! -f "$(ENV_FILE)" ]]; then \
		if [[ -f "$(ENV_TEMPLATE)" ]]; then \
			cp "$(ENV_TEMPLATE)" "$(ENV_FILE)"; \
			echo "Created $(ENV_FILE) from $(ENV_TEMPLATE)"; \
		else \
			echo "Missing $(ENV_TEMPLATE). Create it or run cp .env.template .env"; \
			exit 1; \
		fi; \
	fi

.PHONY: anvil
anvil: check-docker env-init
	@docker compose $(DOCKER_ENV_FILE) -f "$(ANVIL_COMPOSE_FILE)" up -d postgres anvil

.PHONY: anvil-wait
anvil-wait: check-docker env-init
	@echo "Waiting for anvil..."
	@until docker compose $(DOCKER_ENV_FILE) -f "$(ANVIL_COMPOSE_FILE)" exec -T anvil \
		cast block-number --rpc-url http://127.0.0.1:$(ANVIL_PORT) >/dev/null 2>&1; do \
		sleep 0.2; \
	done
	@echo "anvil is ready."

.PHONY: anvil-fg
anvil-fg: check-docker env-init
	@docker compose $(DOCKER_ENV_FILE) -f "$(ANVIL_COMPOSE_FILE)" up postgres anvil

.PHONY: anvil-down
anvil-down: check-docker env-init
	@docker compose $(DOCKER_ENV_FILE) -f "$(ANVIL_COMPOSE_FILE)" down

.PHONY: anvil-logs
anvil-logs: check-docker env-init
	@docker compose $(DOCKER_ENV_FILE) -f "$(ANVIL_COMPOSE_FILE)" logs -f anvil

# --- shovel (docker) ---
.PHONY: shovel-up
shovel-up: check-docker env-init infra-check
	@docker compose $(DOCKER_ENV_FILE) -f "$(ANVIL_COMPOSE_FILE)" up -d shovel

.PHONY: shovel-logs
shovel-logs: check-docker env-init
	@docker compose $(DOCKER_ENV_FILE) -f "$(ANVIL_COMPOSE_FILE)" logs -f shovel

# --- shovel (index supply) ---




# --- erc8004 (foundry) ---
.PHONY: test-erc8004
test-erc8004: check-docker anvil-wait
	@docker compose $(DOCKER_ENV_FILE) -f "$(ANVIL_COMPOSE_FILE)" run --rm foundry \
	  "cd /repo/contracts/erc8004 && forge test"

.PHONY: deploy-erc8004
deploy-erc8004: check-docker env-init anvil-wait
	@mkdir -p "$(ERC8004_DIR)/broadcast"
	@docker compose $(DOCKER_ENV_FILE) -f "$(ANVIL_COMPOSE_FILE)" run --rm \
	  -e DEPLOYER_PRIVATE_KEY="$(ANVIL_DEPLOYER_KEY)" \
	  foundry "cd /repo/contracts/erc8004 && forge script script/DeployIdentityRegistry.s.sol:DeployIdentityRegistry \
	  --rpc-url $(ANVIL_DOCKER_URL) --broadcast"

.PHONY: deploy-commerce-payments
deploy-commerce-payments: check-docker env-init anvil-wait
	@./scripts/deploy_commerce_payments.sh \
		"$(ANVIL_COMPOSE_FILE)" \
		"$(ENV_FILE)" \
		"$(ANVIL_DOCKER_URL)" \
		"$(ANVIL_DEPLOYER_KEY)"

.PHONY: infra-check
infra-check: check-docker env-init
	@./scripts/build_contract_abis.sh \
		"$(ANVIL_COMPOSE_FILE)" \
		"$(ENV_FILE)" \
		"$(SHOVEL_CONTRACTS_CONFIG)"
	@pnpm -C packages/config run shovel-abi-check -- \
		"$(SHOVEL_CONTRACTS_CONFIG)"
	@pnpm -C packages/config run generate-shovel-config -- \
		"$(ENV_FILE)" \
		"$(SHOVEL_CONTRACTS_CONFIG)" \
		"$(SHOVEL_CONFIG)"
	@python3 -m json.tool "$(SHOVEL_CONFIG)" >/dev/null
	@echo "OK: valid JSON"

.PHONY: infra-up
infra-up: env-init anvil deploy-erc8004 deploy-commerce-payments shovel-up

.PHONY: infra-down
infra-down: env-init anvil-down

.PHONY: infra-clean
infra-clean:
	@rm -f "$(ENV_FILE)" "$(SHOVEL_CONFIG)"

.PHONY: seed-erc8004
seed-erc8004: check-docker env-init anvil-wait
	@mkdir -p "$(ERC8004_DIR)/broadcast"
	@docker compose $(DOCKER_ENV_FILE) -f "$(ANVIL_COMPOSE_FILE)" run --rm \
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
	@pnpm -r lint
	@pnpm -r format
	@./scripts/python_fmt.sh
