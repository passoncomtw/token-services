const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials' : true // Required for cookies, authorization headers with HTTPS
};

const response = (statusCode) => (res, body) =>  {
  return res.status(statusCode).json(body);
}
  

// Common responses
const responseAddOk = response(201);
const responseBadRequest = response(400);
const responseNotAuth = response(401);
const responseInternalErr = response(500);

module.exports.responseOk = response(200);

module.exports.responseAddOk = responseAddOk;

module.exports.responseBadRequest = responseBadRequest;

module.exports.responseNotAuth = responseNotAuth;

module.exports.responseInternalErr = responseInternalErr;


// Customized responses

module.exports.responseErr = body => responseBadRequest(body);

module.exports.responseErrWithMsg = (res, message, status=0) => responseBadRequest(res, {data: {status, message}});

module.exports.responseAddOperationFail = result => {
  const message = 'Add Operation Fail';
  return responseBadRequest({message});
};

module.exports.responseServerError = (title, err) => {
  const message = `${title} error`;
  return responseInternalErr({message});
};

module.exports.responseNeedDataError = (description = null) => {
  const message = 'Data required';
  const body = description !== null ? {message, description} : {message};
  return responseBadRequest(body);
};

module.exports.responseParamsError = (title, entity) => {
  const message = 'Missing or bad parameters';
  return responseBadRequest({message});
};

module.exports.responseUserAuthError = () => 
  responseNotAuth({message: 'User authentication error'});
