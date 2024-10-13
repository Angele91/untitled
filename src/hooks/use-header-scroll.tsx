import {useCallback, useEffect, useRef, useState} from "react";

interface UseHeaderScrollOptions {
  headerHeight?: number;
  topThreshold?: number;
}

export const useHeaderScroll = ({headerHeight = 64, topThreshold = 20}: UseHeaderScrollOptions = {}) => {
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollTop = useRef(0);

  const handleScroll = useCallback(() => {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    if (st > lastScrollTop.current) {
      setShowHeader(false);
    } else if (st < lastScrollTop.current) {
      setShowHeader(true);
    }
    lastScrollTop.current = st <= 0 ? 0 : st;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const headerElement = document.querySelector('header');
    if (headerElement && headerElement.contains(e.target as Node)) {
      return;
    }

    if (e.clientY < topThreshold) {
      setShowHeader(true);
    } else if (e.clientY > headerHeight) {
      setShowHeader(false);
    }
  }, [headerHeight, topThreshold]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleScroll, handleMouseMove]);

  return {showHeader};
};