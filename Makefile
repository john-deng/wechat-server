export PORT := 8099

run :
	@./node_modules/.bin/nodemon ./bin/www
.PHONY: run

