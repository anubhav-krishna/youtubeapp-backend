class ApiResponse {
  constructor(data, statusCode = 200,message="Success") {
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
    this.success = statusCode <400;
  }

}

export {ApiResponse};