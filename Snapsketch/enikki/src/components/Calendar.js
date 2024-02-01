import React,{ useState,useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import jaLocale from '@fullcalendar/core/locales/ja'
import interactionPlugin from "@fullcalendar/interaction"
import CalendarPopup from './CalendarPopup'
// import './App.css';

const Calendar = () => {
    const dates = []
    const [showComponent, setShowComponent] = useState(false);
    var clickedDate = ''

    // ポップアップ表示
    const handleDateClick = (info) => {
        clickedDate = info.dateStr
        setShowComponent(true)
    }

    // 投稿した日付
    const fetchCalendar = async () => {
        const url = '/enikki/calendar_test/';
        const options = {
            method: "POST",
            headers: {
                'X-CSRFToken': csrftoken
            }
        }

        try {
            // fetch APIを使ってデータを取得
            const res = await fetch(url, options);

            // レスポンスをJSON形式に変換
            const responseData = await res.json();

            // レスポンスデータからdatesを取得
            dates = responseData.dates;

            console.log(`dates:${dates}`)

        } catch (e) {
            console.log(e);
        }
    }

    return (
        <>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView='dayGridMonth'
                locales={[jaLocale]}
                locale='ja'
                dateClick={handleDateClick}
                dayCellClassNames='date' //マウスオーバーで色変える
            />
            {showComponent && <div id='popup-wrapper'>
                <CalendarPopup date={clickedDate}/>
            </div>}
        </>
    );
}

export default Calendar;