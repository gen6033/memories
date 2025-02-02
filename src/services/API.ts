import { generateUrl } from "@nextcloud/router";

const BASE = "/apps/memories/api";

const gen = generateUrl;

/** Add auth token to this URL */
function tok(url: string) {
  const route = vueroute();
  if (route.name === "folder-share") {
    const token = <string>route.params.token;
    url = API.Q(url, { token });
  } else if (route.name === "album-share") {
    const token = <string>route.params.token;
    url = API.Q(url, { token, album: token });
  }
  return url;
}

export class API {
  static Q(
    url: string,
    query: string | URLSearchParams | Object | undefined | null
  ) {
    if (!query) return url;

    if (query instanceof URLSearchParams) {
      query = query.toString();
    } else if (typeof query === "object") {
      query = new URLSearchParams(query as any).toString();
    }

    if (!query) return url;

    if (url.indexOf("?") > -1) {
      return `${url}&${query}`;
    } else {
      return `${url}?${query}`;
    }
  }

  static DAYS() {
    return tok(gen(`${BASE}/days`));
  }

  static DAY(id: number | string) {
    return tok(gen(`${BASE}/days/{id}`, { id }));
  }

  static ALBUM_LIST(t: 1 | 2 | 3 = 3) {
    return gen(`${BASE}/albums?t=${t}`);
  }

  static ALBUM_DOWNLOAD(user: string, name: string) {
    return gen(`${BASE}/albums/download?name={user}/{name}`, { user, name });
  }

  static PLACE_LIST() {
    return gen(`${BASE}/places`);
  }

  static PLACE_PREVIEW(place: number | string) {
    return gen(`${BASE}/places/preview/{place}`, { place });
  }

  static TAG_LIST() {
    return gen(`${BASE}/tags`);
  }

  static TAG_PREVIEW(tag: string) {
    return gen(`${BASE}/tags/preview/{tag}`, { tag });
  }

  static TAG_SET(fileid: string | number) {
    return gen(`${BASE}/tags/set/{fileid}`, { fileid });
  }

  static FACE_LIST(app: "recognize" | "facerecognition") {
    return gen(`${BASE}/${app}/people`);
  }

  static FACE_PREVIEW(
    app: "recognize" | "facerecognition",
    face: string | number
  ) {
    return gen(`${BASE}/${app}/people/preview/{face}`, { face });
  }

  static ARCHIVE(fileid: number) {
    return gen(`${BASE}/archive/{fileid}`, { fileid });
  }

  static IMAGE_PREVIEW(fileid: number) {
    return tok(gen(`${BASE}/image/preview/{fileid}`, { fileid }));
  }

  static IMAGE_MULTIPREVIEW() {
    return tok(gen(`${BASE}/image/multipreview`));
  }

  static IMAGE_INFO(id: number) {
    return tok(gen(`${BASE}/image/info/{id}`, { id }));
  }

  static IMAGE_SETEXIF(id: number) {
    return gen(`${BASE}/image/set-exif/{id}`, { id });
  }

  static IMAGE_DECODABLE(id: number, etag: string) {
    return tok(API.Q(gen(`${BASE}/image/decodable/{id}`, { id }), { etag }));
  }

  static VIDEO_TRANSCODE(fileid: number, file = "index.m3u8") {
    return tok(
      gen(`${BASE}/video/transcode/{videoClientId}/{fileid}/{file}`, {
        videoClientId,
        fileid,
        file,
      })
    );
  }

  static VIDEO_LIVEPHOTO(fileid: number) {
    return tok(gen(`${BASE}/video/livephoto/{fileid}`, { fileid }));
  }

  static DOWNLOAD_REQUEST() {
    return tok(gen(`${BASE}/download`));
  }

  static DOWNLOAD_FILE(handle: string) {
    return tok(gen(`${BASE}/download/{handle}`, { handle }));
  }

  static STREAM_FILE(id: number) {
    return tok(gen(`${BASE}/stream/{id}`, { id }));
  }

  static SHARE_LINKS() {
    return gen(`${BASE}/share/links`);
  }

  static SHARE_NODE() {
    return gen(`${BASE}/share/node`);
  }

  static SHARE_DELETE() {
    return gen(`${BASE}/share/delete`);
  }

  static CONFIG(setting: string) {
    return gen(`${BASE}/config/{setting}`, { setting });
  }

  static MAP_CLUSTERS() {
    return tok(gen(`${BASE}/map/clusters`));
  }

  static MAP_CLUSTER_PREVIEW(id: number) {
    return tok(gen(`${BASE}/map/clusters/preview/{id}`, { id }));
  }
}
