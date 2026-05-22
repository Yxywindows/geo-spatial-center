export default function SiteFooter() {
  return (
    <footer className="gs-footer">
      <div className="gs-footer__inner">
        <div>
          <p className="gs-footer__brand-name">江苏省地理空间智能与人地系统科学数据中心</p>
          <p className="gs-footer__brand-sub">依托单位：江苏省地理空间智能重点实验室</p>
        </div>
        <div className="gs-footer__links">
          <a href="mailto:geo-spatial@jsdc.cn">geo-spatial@jsdc.cn</a>
          <a href="http://localhost:5173/sub_center/geo-spatial" target="_blank" rel="noopener noreferrer">
            返回主中心门户 →
          </a>
        </div>
      </div>
      <div className="gs-footer__copy">
        © {new Date().getFullYear()} 江苏省科学数据中心 · 地理空间智能与人地系统分中心
      </div>
    </footer>
  )
}
