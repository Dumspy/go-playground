# Simple Makefile for a Go project

# Build the application
all: build test

build:
	@echo "Building..."
	
	@go build -o main cmd/api/main.go

# Run the application
run:
	@go run cmd/api/main.go &
	@pnpm install --prefer-offline --no-fund --prefix ./frontend
	@pnpm run dev --prefix ./frontend

# Test the application
test:
	@echo "Testing..."

	@go test ./... -v

# Clean the binary
clean:
	@echo "Cleaning..."

	@rm -f main

# Live Reload
watch:
	@if command -v air > /dev/null; then \
            air; \
            echo "Watching...";\
        else \
            read -p "Go's 'air' is not installed on your machine. Do you want to install it? [Y/n] " choice; \
            if [ "$$choice" != "n" ] && [ "$$choice" != "N" ]; then \
                go install github.com/air-verse/air@latest; \
                air; \
                echo "Watching...";\
            else \
                echo "You chose not to install air. Exiting..."; \
                exit 1; \
            fi; \
        fi

#Swagger
swagger:
	@if command -v swag > /dev/null; then \
		swag init --v3.1 -pd --propertyStrategy pascalcase -g cmd/api/main.go --output ./openapi --outputTypes json; \
	else \
		read -p "Go's 'swag' is not installed on your machine. Do you want to install it? [Y/n] " choice; \
		if [ "$$choice" != "n" ] && [ "$$choice" != "N" ]; then \
			go install github.com/swaggo/swag/v2/cmd/swag@latest; \
			swag init --v3.1 -pd --propertyStrategy pascalcase -g cmd/api/main.go --output ./openapi --outputTypes json; \
		else \
			echo "You chose not to install swag. Exiting..."; \
			exit 1; \
		fi; \
	fi

.PHONY: all build run test clean watch
