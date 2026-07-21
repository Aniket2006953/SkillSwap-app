function StarRating({ rating }) {
  const totalStars = 5

  return (
    <div style={{ color: "gold", fontSize: "18px" }}>
      {[...Array(totalStars)].map((_, index) => {
        return (
          <span key={index}>
            {index < Math.round(rating) ? "★" : "☆"}
          </span>
        )
      })}
    </div>
  )
}

export default StarRating