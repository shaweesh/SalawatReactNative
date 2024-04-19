import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import moment from 'moment-timezone';
import PushNotification from 'react-native-push-notification';
import prayerTimesData from '../../assets/Salawat.json'; // Import the JSON data locally


const PrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState([]);
  const [currentPrayerTime, setCurrentPrayerTime] = useState(null);
  const [currentYear, setCurrentYear] = useState(moment().year());
  const [currentMonth, setCurrentMonth] = useState(moment().month() + 1);
  const [currentDay, setCurrentDay] = useState(moment().date());
  const [currentMinute, setCurrentMinute] = useState(moment().minute());

  useEffect(() => {
    // Update current minute every minute
    const minuteInterval = setInterval(() => {
      setCurrentMinute(moment().minute());
    }, 60000);

    // Update current day every 24 hours
    const dayInterval = setInterval(() => {
      setCurrentDay(moment().date());
    }, 24 * 60 * 60 * 1000);

    // Update current month based on days in the month
    const monthInterval = setInterval(() => {
      const currentMonthEnd = moment().endOf('month');
      const nextMonthStart = moment().add(1, 'month').startOf('month');
      const daysInCurrentMonth = Math.floor((nextMonthStart - currentMonthEnd) / (1000 * 60 * 60 * 24));
      setCurrentMonth(currentMonth + 1);
      setCurrentYear(currentMonthEnd.year());
      setCurrentDay(currentMonthEnd.date());
      setCurrentMinute(currentMonthEnd.minute());
      clearInterval(monthInterval);
      setTimeout(() => {
        monthInterval = setInterval(() => {
          const currentMonthEnd = moment().endOf('month');
          const nextMonthStart = moment().add(1, 'month').startOf('month');
          const daysInCurrentMonth = Math.floor((nextMonthStart - currentMonthEnd) / (1000 * 60 * 60 * 24));
          setCurrentMonth(currentMonth + 1);
          setCurrentYear(currentMonthEnd.year());
          setCurrentDay(currentMonthEnd.date());
          setCurrentMinute(currentMonthEnd.minute());
        }, daysInCurrentMonth * 24 * 60 * 60 * 1000);
      }, 1000);
    }, 1000);

    if (prayerTimes.length > 0) {
      // Calculate current time in Hebron timezone
      const currentTime = moment().tz('Asia/Hebron').format('h:mm A');
      const matchingPrayerTime = prayerTimes.find(
        prayerTime =>
          prayerTime.day === currentDay &&
          prayerTime.month === currentMonth
      );

      if (matchingPrayerTime) {
        // Calculate prayer times for the day
        const fajer = moment.utc(`${currentYear}-${matchingPrayerTime.month}-${matchingPrayerTime.day}T${matchingPrayerTime.fajer}:00Z`).tz('Asia/Hebron').format('h:mm A');
        const sunrise = moment.utc(`${currentYear}-${matchingPrayerTime.month}-${matchingPrayerTime.day}T${matchingPrayerTime.sunrise}:00Z`).tz('Asia/Hebron').format('h:mm A');
        const dhuhur = moment.utc(`${currentYear}-${matchingPrayerTime.month}-${matchingPrayerTime.day}T${matchingPrayerTime.dhuhur}:00Z`).tz('Asia/Hebron').format('h:mm A');
        const asr = moment.utc(`${currentYear}-${matchingPrayerTime.month}-${matchingPrayerTime.day}T${matchingPrayerTime.asr}:00Z`).tz('Asia/Hebron').format('h:mm A');
        const maghreb = moment.utc(`${currentYear}-${matchingPrayerTime.month}-${matchingPrayerTime.day}T${matchingPrayerTime.maghreb}:00Z`).tz('Asia/Hebron').format('h:mm A');
        const isha = moment.utc(`${currentYear}-${matchingPrayerTime.month}-${matchingPrayerTime.day}T${matchingPrayerTime.isha}:00Z`).tz('Asia/Hebron').format('h:mm A');

        setCurrentPrayerTime({
          fajer: fajer,
          sunrise: sunrise,
          dhuhur: dhuhur,
          asr: asr,
          maghreb: maghreb,
          isha: isha,
        });

        // Schedule notifications for each prayer time
        if (currentTime === fajer) {
          scheduleNotification(fajer, 'Fajer Prayer Time', 'It is time for Fajer prayer.');
        } else if (currentTime === dhuhur) {
          scheduleNotification(dhuhur, 'Dhuhur Prayer Time', 'It is time for Dhuhur prayer.');
        } else if (currentTime === asr) {
          scheduleNotification(asr, 'Asr Prayer Time', 'It is time for Asr prayer.');
        } else if (currentTime === maghreb) {
          scheduleNotification(maghreb, 'Maghreb Prayer Time', 'It is time for Maghreb prayer.');
        } else if (currentTime === isha) {
          scheduleNotification(isha, 'Isha Prayer Time', 'It is time for Isha prayer.');
        }
      }
    }

    return () => {
      // Clear intervals when component unmounts
      clearInterval(minuteInterval);
      clearInterval(dayInterval);
      clearInterval(monthInterval);
    };
  }, [prayerTimes, currentYear, currentMonth, currentDay, currentMinute]);

  useEffect(() => {
    // Fetch prayer times data
    // const fetchPrayerTimes = async () => {
    //   const response = await fetch('https://raw.githubusercontent.com/shaweesh/salawat/main/assets/Salawat.json');
    //   const data = await response.json();
    //   setPrayerTimes(data.data);
    // };

    const fetchPrayerTimes = async () => {
      setPrayerTimes(prayerTimesData.data); // Set the local JSON data to the state
    };

    fetchPrayerTimes();

    return () => {
      clearInterval(monthInterval);
    };
  }, [currentYear, currentMonth, currentDay]);

  const scheduleNotification = (time, title, message) => {
    // Schedule local notifications
    const trigger = moment(time, 'h:mm A').toDate();
    PushNotification.localNotificationSchedule({
      title: title,
      message: message,
      date: trigger,
    });
  };

  return (
    <View>
      {currentPrayerTime && (
        <View>
          <Text>Today's Prayer Times in Jerusalem Timezone:</Text>
          <Text>Fajer: {currentPrayerTime.fajer}</Text>
          <Text>Sunrise: {currentPrayerTime.sunrise}</Text>
          <Text>Dhuhur: {currentPrayerTime.dhuhur}</Text>
          <Text>Asr: {currentPrayerTime.asr}</Text>
          <Text>Maghreb: {currentPrayerTime.maghreb}</Text>
          <Text>Isha: {currentPrayerTime.isha}</Text>
        </View>
      )}
    </View>
  );
};

export default PrayerTimes;