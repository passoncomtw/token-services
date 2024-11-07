export const DOMAINS = process.env.EXPO_PUBLIC_API_URL;

const parseJsonString = (jsonStr) => {
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    return jsonStr;
  }
};

const parseResponse = (response) => {
  return new Promise((resolve, reject) => {
    const { status: statusCode, ok: responseOk } = response;
    response
      .text()
      .then((str) => {
        const result = parseJsonString(str);

        const { data } = result;
        const ok = responseOk && statusCode >= 200 && statusCode < 300;

        if (!ok) throw { message: data.message };
        return resolve({
          ok,
          status: statusCode,
          result,
        });
      })
      .catch(reject);
  });
};

const defaultFetch = (route, requestBody) => {
  return new Promise((resolve, reject) => {
    fetch(`${DOMAINS}${route}`, requestBody)
      .then(parseResponse)
      .then(resolve)
      .catch(reject);
  });
};

export default defaultFetch;
