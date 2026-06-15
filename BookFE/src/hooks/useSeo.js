import { useEffect } from "react";

const SITE_NAME = "Digital Books";
const DEFAULT_DESCRIPTION =
  "Digital Books là nền tảng mua bán sách trực tuyến dành cho độc giả, tác giả và quản trị viên.";

function getSeoByPath(pathname) {
  if (pathname.startsWith("/admin")) {
    return {
      title: `Quản trị | ${SITE_NAME}`,
      description: "Khu vực quản trị hệ thống Digital Books.",
      robots: "noindex,nofollow",
    };
  }

  if (pathname.startsWith("/author")) {
    return {
      title: `Tác giả | ${SITE_NAME}`,
      description: "Khu vực dành cho tác giả trên Digital Books.",
      robots: "noindex,nofollow",
    };
  }

  if (pathname === "/cart") {
    return {
      title: `Giỏ hàng | ${SITE_NAME}`,
      description: "Xem và quản lý các sách đã thêm vào giỏ hàng.",
      robots: "noindex,nofollow",
    };
  }

  if (pathname === "/profile") {
    return {
      title: `Hồ sơ cá nhân | ${SITE_NAME}`,
      description: "Quản lý thông tin tài khoản và lịch sử mua sách.",
      robots: "noindex,nofollow",
    };
  }

  return {
    title: `${SITE_NAME} - Nền tảng sách trực tuyến`,
    description: DEFAULT_DESCRIPTION,
    robots: "index,follow",
  };
}

function ensureMeta(selector, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    const [key, raw] = selector.split("[");
    if (key === "meta" && raw?.startsWith("name=")) {
      document.head.appendChild(el);
    } else {
      document.head.appendChild(el);
    }
  }
  const [attribute, field] = attr.split("=");
  if (attribute === "name") {
    el.setAttribute("name", field);
  } else if (attribute === "property") {
    el.setAttribute("property", field);
  } else {
    el.setAttribute(attribute, field);
  }
  el.setAttribute("content", value);
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export default function useSeo(pathname) {
  useEffect(() => {
    const { title, description, robots } = getSeoByPath(pathname);
    document.title = title;

    ensureMeta('meta[name="description"]', "name=description", description);
    ensureMeta('meta[name="robots"]', "name=robots", robots);
    ensureMeta('meta[property="og:title"]', "property=og:title", title);
    ensureMeta(
      'meta[property="og:description"]',
      "property=og:description",
      description,
    );
    ensureMeta('meta[name="twitter:title"]', "name=twitter:title", title);
    ensureMeta(
      'meta[name="twitter:description"]',
      "name=twitter:description",
      description,
    );

    if (window?.location?.origin) {
      setLink("canonical", `${window.location.origin}${pathname}`);
    }
  }, [pathname]);
}
